// backend/src/services/availability.service.js
/**
 * Central availability: service duration, slot step, multi-master, overrides, VIP flags.
 * Time model: Asia/Tashkent wall clock via fixed UTC offset (no DST).
 */

import mongoose from "mongoose"
import Service from "../models/Service.js"
import Branch from "../models/Branch.js"
import Master from "../models/Master.js"
import MasterAvailability from "../models/MasterAvailability.js"
import Booking from "../models/Booking.js"
import { getBlockedInfoForDate } from "./blockedSlot.service.js"

const TZ_OFFSET_MIN =
  Number(process.env.BUSINESS_TZ_OFFSET_MIN) ||
  Number(process.env.TZ_OFFSET_MIN) ||
  300

const VIP_END_MIN = 10 * 60
const VIP_START_MIN = 19 * 60

export function parseHHMM(s) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || "").trim())
  if (!m) return null
  const h = Number(m[1])
  const mi = Number(m[2])
  if (!Number.isFinite(h) || !Number.isFinite(mi)) return null
  if (h < 0 || h > 23 || mi < 0 || mi > 59) return null
  return h * 60 + mi
}

export function formatHHMM(totalMin) {
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

function parseWorkingRange(str) {
  const parts = String(str || "")
    .split("-")
    .map((x) => x.trim())
  if (parts.length < 2) return { openMin: 9 * 60, closeMin: 21 * 60 }
  const openMin = parseHHMM(parts[0])
  const closeMin = parseHHMM(parts[1])
  if (openMin == null || closeMin == null)
    return { openMin: 9 * 60, closeMin: 21 * 60 }
  return { openMin, closeMin }
}

function isWeekendYmd(dateYmd) {
  const [y, mo, d] = dateYmd.split("-").map(Number)
  const utc = Date.UTC(y, mo - 1, d, 12, 0, 0, 0)
  const wd = new Date(utc).getUTCDay()
  return wd === 0 || wd === 6
}

/** Start of calendar day in salon TZ as UTC epoch ms for the given Y-M-D */
function tzDayStartMs(dateYmd) {
  const [y, mo, d] = dateYmd.split("-").map(Number)
  return Date.UTC(y, mo - 1, d, 0, 0, 0, 0) - TZ_OFFSET_MIN * 60 * 1000
}

export function localMinutesToDate(dateYmd, minutes) {
  return new Date(tzDayStartMs(dateYmd) + minutes * 60 * 1000)
}

function dateToLocalMinutes(dateYmd, dateObj) {
  if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return null
  const diff = dateObj.getTime() - tzDayStartMs(dateYmd)
  return Math.round(diff / 60000)
}

function branchOpenCloseMin(branch, dateYmd) {
  const weekend = isWeekendYmd(dateYmd)
  const raw = weekend
    ? branch.workingHoursWeekend
    : branch.workingHoursWeekdays
  return parseWorkingRange(raw)
}

function mergeIntervals(intervals) {
  if (!intervals.length) return []
  const sorted = [...intervals].sort((a, b) => a[0] - b[0])
  const out = []
  let [cs, ce] = sorted[0]
  for (let i = 1; i < sorted.length; i++) {
    const [s, e] = sorted[i]
    if (s <= ce) ce = Math.max(ce, e)
    else {
      out.push([cs, ce])
      cs = s
      ce = e
    }
  }
  out.push([cs, ce])
  return out
}

/** Half-open [a0,a1) vs [b0,b1) */
export function rangesOverlapMs(a0, a1, b0, b1) {
  return a0 < b1 && b0 < a1
}

export function slotIsVip(slotStartMin) {
  return slotStartMin < VIP_END_MIN || slotStartMin >= VIP_START_MIN
}

export function assertServiceAllowsTime(service, timeHHMM) {
  const tm = parseHHMM(timeHHMM)
  if (tm == null) throw new Error("Invalid time")
  if (slotIsVip(tm) && service.vipAllowed === false) {
    throw new Error("VIP time not allowed for this service")
  }
}

function masterCoversService(master, serviceObjectId) {
  if (!master.serviceIds?.length) return true
  return master.serviceIds.some(
    (id) => String(id) === String(serviceObjectId)
  )
}

/**
 * If no masters exist for a branch, slot math yields zero capacity (all slots unavailable).
 * Idempotent: creates default masters so production works without a manual seed step.
 */
async function ensureMinMastersForBranch(branchOid, branch, minimum) {
  const n = Math.max(1, Math.floor(Number(minimum) || 1))
  const active = await Master.countDocuments({
    branchId: branchOid,
    isActive: true,
  })
  if (active >= n) return

  const branchName = branch?.name || "Салон"
  for (let i = active; i < n; i++) {
    await Master.create({
      name: `Мастер ${i + 1} · ${branchName}`,
      branchId: branchOid,
      serviceIds: [],
      isActive: true,
    })
  }
}

async function loadOverrideIntervals(masterId, branchObjectId, dateYmd) {
  const docs = await MasterAvailability.find({
    masterId,
    branchId: branchObjectId,
    date: dateYmd,
    type: "override",
  })
    .select("start end")
    .lean()

  return mergeIntervals(
    docs.map((d) => [d.start.getTime(), d.end.getTime()])
  ).map(([a, b]) => ({ startMs: a, endMs: b }))
}

function defaultBranchIntervalsMs(branch, dateYmd) {
  const { openMin, closeMin } = branchOpenCloseMin(branch, dateYmd)
  const s = localMinutesToDate(dateYmd, openMin).getTime()
  const e = localMinutesToDate(dateYmd, closeMin).getTime()
  return [{ startMs: s, endMs: e }]
}

/**
 * Working intervals for master on date (merged). Override replaces default for that day.
 */
async function masterWorkingIntervalsMs(master, branch, dateYmd, branchOid) {
  const ov = await loadOverrideIntervals(master._id, branchOid, dateYmd)
  if (ov.length) return ov
  return defaultBranchIntervalsMs(branch, dateYmd)
}

/**
 * True if [slotStart, slotEnd) half-open is inside union of working windows.
 */
function intervalInsideWorking(slotStartMs, slotEndMs, windows) {
  if (slotEndMs <= slotStartMs) return false
  return windows.some(
    (w) => slotStartMs >= w.startMs && slotEndMs <= w.endMs
  )
}

function slotOverlapsBlocked(slotStartMin, slotEndMin, blockedTimes, dateYmd, blockSpanMin) {
  if (!blockedTimes?.length) return false
  const step = Math.max(5, Number(blockSpanMin) || 30)
  for (const bt of blockedTimes) {
    const bm = parseHHMM(bt)
    if (bm == null) continue
    const b0 = localMinutesToDate(dateYmd, bm).getTime()
    const b1 = localMinutesToDate(dateYmd, bm + step).getTime()
    const s0 = localMinutesToDate(dateYmd, slotStartMin).getTime()
    const s1 = localMinutesToDate(dateYmd, slotEndMin).getTime()
    if (rangesOverlapMs(s0, s1, b0, b1)) return true
  }
  return false
}

/**
 * Booking → { startMs, endMs, masterIds[], legacy: boolean }
 */
function bookingToOccupancy(b, dateYmd) {
  let startMs
  let endMs
  const durMin = Number(b.serviceDuration) || 60

  if (b.start != null && b.end != null) {
    const st = new Date(b.start)
    const en = new Date(b.end)
    if (!Number.isNaN(st.getTime()) && !Number.isNaN(en.getTime())) {
      startMs = st.getTime()
      endMs = en.getTime()
    }
  }

  if (startMs == null || endMs == null) {
    const tm = parseHHMM(b.time)
    if (tm == null) return null
    startMs = localMinutesToDate(dateYmd, tm).getTime()
    endMs = startMs + durMin * 60 * 1000
  }

  if (!(endMs > startMs)) return null

  const masterIds = Array.isArray(b.masters)
    ? b.masters.map((id) => String(id))
    : []

  return {
    startMs,
    endMs,
    masterIds,
    legacy: masterIds.length === 0,
  }
}

/**
 * @returns {string[]} sorted master _id strings that are free on [slotStartMs, slotEndMs)
 */
async function findFreeMasterIds({
  masters,
  branch,
  branchOid,
  dateYmd,
  slotStartMs,
  slotEndMs,
  occupancy,
  workingCache,
}) {
  const free = []
  for (const m of masters) {
    const key = String(m._id)
    if (!workingCache.has(key)) {
      workingCache.set(
        key,
        await masterWorkingIntervalsMs(m, branch, dateYmd, branchOid)
      )
    }
    const windows = workingCache.get(key)
    if (!intervalInsideWorking(slotStartMs, slotEndMs, windows)) continue

    let busy = false
    for (const occ of occupancy) {
      if (!rangesOverlapMs(slotStartMs, slotEndMs, occ.startMs, occ.endMs))
        continue
      if (occ.masterIds.includes(key)) {
        busy = true
        break
      }
    }
    if (busy) continue

    free.push(key)
  }
  return free
}

function legacyOverlapCount(occupancy, slotStartMs, slotEndMs) {
  return occupancy.filter(
    (o) =>
      o.legacy &&
      rangesOverlapMs(slotStartMs, slotEndMs, o.startMs, o.endMs)
  ).length
}

/**
 * Available master count for interval accounting for legacy bookings (no master ids).
 */
async function countAssignableMasters({
  masters,
  branch,
  branchOid,
  dateYmd,
  slotStartMin,
  slotEndMin,
  occupancy,
  workingCache,
  required,
}) {
  const slotStartMs = localMinutesToDate(dateYmd, slotStartMin).getTime()
  const slotEndMs = localMinutesToDate(dateYmd, slotEndMin).getTime()

  const free = await findFreeMasterIds({
    masters,
    branch,
    branchOid,
    dateYmd,
    slotStartMs,
    slotEndMs,
    occupancy,
    workingCache,
  })

  free.sort()
  const legacyCount = legacyOverlapCount(occupancy, slotStartMs, slotEndMs)
  return Math.max(0, free.length - legacyCount) >= required
}

export async function loadOccupancy(branchId, dateYmd) {
  const bid =
    typeof branchId === "string"
      ? new mongoose.Types.ObjectId(branchId)
      : branchId

  const rows = await Booking.find({
    branchId: bid,
    date: dateYmd,
    status: "confirmed",
  })
    .select("time serviceDuration masters start end")
    .lean()

  const occupancy = []
  for (const b of rows) {
    const o = bookingToOccupancy(b, dateYmd)
    if (o) occupancy.push(o)
  }
  return occupancy
}

/**
 * Main API: slots with { time, available, isVip } sorted by time.
 */
export async function generateAvailableSlots({
  serviceId,
  branchId,
  date: dateYmd,
  serviceLevel: _serviceLevel,
}) {
  const service = await Service.findById(serviceId).lean()
  if (!service || !service.isActive) {
    throw new Error("Service not found or inactive")
  }

  if (service.isManualBooking) {
    return { type: "manual" }
  }

  const branch = await Branch.findById(branchId).lean()
  if (!branch) throw new Error("Branch not found")

  const duration = Math.max(5, Number(service.duration) || 60)
  const step = Math.max(5, Number(service.slotInterval) || 30)
  const required = Math.max(1, Number(service.requiredMasters) || 1)
  const vipAllowed = service.vipAllowed !== false

  const branchOid =
    typeof branchId === "string"
      ? new mongoose.Types.ObjectId(branchId)
      : branchId

  const svcOid = new mongoose.Types.ObjectId(serviceId)

  await ensureMinMastersForBranch(
    branchOid,
    branch,
    Math.max(required, 2)
  )

  let masters = await Master.find({
    branchId: branchOid,
    isActive: true,
  }).lean()

  masters = masters.filter((m) => masterCoversService(m, svcOid))

  const { isDayBlocked, times: blockedTimes } = await getBlockedInfoForDate({
    branchId,
    date: dateYmd,
  })

  const { openMin, closeMin } = branchOpenCloseMin(branch, dateYmd)

  const occupancy = await loadOccupancy(branchId, dateYmd)
  const workingCache = new Map()

  const slots = []

  if (isDayBlocked) {
    return { type: "slots", slots: [] }
  }

  for (let t = openMin; t + duration <= closeMin; t += step) {
    const slotEnd = t + duration

    if (slotOverlapsBlocked(t, slotEnd, blockedTimes, dateYmd, step)) {
      if (vipAllowed || !slotIsVip(t)) {
        slots.push({
          time: formatHHMM(t),
          available: false,
          isVip: slotIsVip(t),
        })
      }
      continue
    }

    const isVip = slotIsVip(t)
    if (isVip && !vipAllowed) continue

    let slotOk = false
    if (masters.length >= required) {
      slotOk = await countAssignableMasters({
        masters,
        branch,
        branchOid,
        dateYmd,
        slotStartMin: t,
        slotEndMin: slotEnd,
        occupancy,
        workingCache,
        required,
      })
    }

    slots.push({
      time: formatHHMM(t),
      available: slotOk,
      isVip,
    })
  }

  slots.sort((a, b) => a.time.localeCompare(b.time))
  return { type: "slots", slots }
}

/**
 * Pick masters for a new booking; throws if not enough capacity.
 */
export async function assignMastersForSlot({
  branchId,
  serviceId,
  date: dateYmd,
  time: timeHHMM,
  excludeBookingId,
}) {
  const service = await Service.findById(serviceId).lean()
  if (!service || !service.isActive) throw new Error("Service not available")

  if (service.isManualBooking) {
    throw new Error("Manual booking service — use admin contact flow")
  }

  const duration = Math.max(5, Number(service.duration) || 60)
  const required = Math.max(1, Number(service.requiredMasters) || 1)

  const branch = await Branch.findById(branchId).lean()
  if (!branch) throw new Error("Branch not found")

  const branchOid =
    typeof branchId === "string"
      ? new mongoose.Types.ObjectId(branchId)
      : branchId

  const svcOid = new mongoose.Types.ObjectId(serviceId)

  await ensureMinMastersForBranch(
    branchOid,
    branch,
    Math.max(required, 2)
  )

  let masters = await Master.find({
    branchId: branchOid,
    isActive: true,
  }).lean()

  masters = masters.filter((m) => masterCoversService(m, svcOid))

  const tm = parseHHMM(timeHHMM)
  if (tm == null) throw new Error("Invalid time")

  const slotStartMin = tm
  const slotEndMin = tm + duration
  const slotStartMs = localMinutesToDate(dateYmd, slotStartMin).getTime()
  const slotEndMs = localMinutesToDate(dateYmd, slotEndMin).getTime()

  const bookings = await Booking.find({
    branchId: branchOid,
    date: dateYmd,
    status: "confirmed",
    ...(excludeBookingId ? { _id: { $ne: excludeBookingId } } : {}),
  })
    .select("time serviceDuration masters start end")
    .lean()

  const occupancy = []
  for (const b of bookings) {
    const o = bookingToOccupancy(b, dateYmd)
    if (o) occupancy.push(o)
  }

  const workingCache = new Map()
  const free = await findFreeMasterIds({
    masters,
    branch,
    branchOid,
    dateYmd,
    slotStartMs,
    slotEndMs,
    occupancy,
    workingCache,
  })

  free.sort()
  const legacyCount = legacyOverlapCount(occupancy, slotStartMs, slotEndMs)
  if (free.length < legacyCount + required) {
    throw new Error("Time slot is full")
  }

  const chosen = free
    .slice(legacyCount, legacyCount + required)
    .map((id) => new mongoose.Types.ObjectId(id))

  const start = localMinutesToDate(dateYmd, slotStartMin)
  const end = new Date(start.getTime() + duration * 60 * 1000)

  return { masterIds: chosen, start, end }
}

/**
 * POST /availability/override — extend working hours for a master on a date.
 */
export async function addAvailabilityOverride({
  masterId,
  branchId,
  date: dateYmd,
  start: startInput,
  end: endInput,
}) {
  const master = await Master.findById(masterId)
  if (!master) throw new Error("Master not found")

  const branchOid =
    typeof branchId === "string"
      ? new mongoose.Types.ObjectId(branchId)
      : branchId

  if (String(master.branchId) !== String(branchOid)) {
    throw new Error("Master branch mismatch")
  }

  let startMs
  let endMs

  if (startInput instanceof Date && endInput instanceof Date) {
    startMs = startInput.getTime()
    endMs = endInput.getTime()
  } else {
    const sm = parseHHMM(startInput)
    const em = parseHHMM(endInput)
    if (sm == null || em == null) throw new Error("Invalid start/end time")
    startMs = localMinutesToDate(dateYmd, sm).getTime()
    endMs = localMinutesToDate(dateYmd, em).getTime()
  }

  if (endMs <= startMs) throw new Error("end must be after start")

  const doc = await MasterAvailability.create({
    masterId,
    branchId: branchOid,
    date: dateYmd,
    start: new Date(startMs),
    end: new Date(endMs),
    type: "override",
  })

  return doc
}
