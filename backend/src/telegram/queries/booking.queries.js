// backend/src/telegram/queries/booking.queries.js

import Booking from "../../models/Booking.js"
import Branch from "../../models/Branch.js"

const BUSINESS_TZ =
  process.env.BUSINESS_TIMEZONE ||
  process.env.TZ ||
  // default for this project/business (change via env in production)
  "Asia/Tashkent"

const toYMDInTZ = (d, timeZone = BUSINESS_TZ) => {
  // sv-SE reliably formats as YYYY-MM-DD
  try {
    return new Intl.DateTimeFormat("sv-SE", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date(d))
  } catch {
    // Fallback: server-local (better than crashing)
    const x = new Date(d)
    const yyyy = x.getFullYear()
    const mm = String(x.getMonth() + 1).padStart(2, "0")
    const dd = String(x.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }
}

const addDaysLocal = (ymd, days) => {
  const [y, m, d] = ymd.split("-").map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  // When we already have a YYYY-MM-DD in business TZ, adding days in calendar
  // space is fine; format again in business TZ for consistency.
  return toYMDInTZ(dt)
}

export const getBookingById = async (bookingId) => {
  return await Booking.findById(bookingId)
    .populate("branchId", "name address")
    .lean()
}

export const getActiveBranches = async () => {
  return await Branch.find({ isActive: true }).sort({ name: 1 }).lean()
}

export const getBookingsTodayPage = async ({
  page = 0,
  limit = 5,
  branchId = null,
  serviceLevel = null
}) => {
  const today = toYMDInTZ(new Date())

  // Fetch one extra to detect hasNext without expensive count
  const query = {
    date: today,
    status: "confirmed"
  }

  if (branchId) query.branchId = branchId
  if (serviceLevel) query.serviceLevel = serviceLevel

  const docs = await Booking.find(query)
    .populate("branchId", "name address")
    .sort({ time: 1 })
    .skip(page * limit)
    .limit(limit + 1)
    .lean()

  const hasNext = docs.length > limit
  const items = hasNext ? docs.slice(0, limit) : docs

  return {
    items,
    page,
    limit,
    hasPrev: page > 0,
    hasNext
  }
}

export const getBookingsNext7DaysPage = async ({
  page = 0,
  limit = 5,
  branchId = null,
  serviceLevel = null
}) => {
  const start = toYMDInTZ(new Date())
  // inclusive range: today + next 6 days = 7 days total
  const end = addDaysLocal(start, 6)

  const query = {
    date: { $gte: start, $lte: end },
    status: "confirmed"
  }

  if (branchId) query.branchId = branchId
  if (serviceLevel) query.serviceLevel = serviceLevel

  const docs = await Booking.find(query)
    .populate("branchId", "name address")
    .sort({ date: 1, time: 1 })
    .skip(page * limit)
    .limit(limit + 1)
    .lean()

  const hasNext = docs.length > limit
  const items = hasNext ? docs.slice(0, limit) : docs

  return {
    items,
    page,
    limit,
    hasPrev: page > 0,
    hasNext
  }
}

export const getBookingsByDatePage = async ({
  date,
  page = 0,
  limit = 5,
  branchId = null,
  serviceLevel = null
}) => {
  const query = {
    date,
    status: "confirmed"
  }

  if (branchId) query.branchId = branchId
  if (serviceLevel) query.serviceLevel = serviceLevel

  const docs = await Booking.find(query)
    .populate("branchId", "name address")
    .sort({ time: 1 })
    .skip(page * limit)
    .limit(limit + 1)
    .lean()

  const hasNext = docs.length > limit
  const items = hasNext ? docs.slice(0, limit) : docs

  return {
    items,
    page,
    limit,
    hasPrev: page > 0,
    hasNext
  }
}

