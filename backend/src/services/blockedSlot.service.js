// backend/src/services/blockedSlot.service.js

import BlockedSlot from "../models/BlockedSlot.js"

export const getBlockedInfoForDate = async ({ branchId, date }) => {
  const docs = await BlockedSlot.find({ branchId, date })
    .select("time")
    .lean()

  const isDayBlocked = docs.some((d) => d.time == null)
  const times = docs
    .map((d) => d.time)
    .filter((t) => typeof t === "string" && t.length > 0)

  return { isDayBlocked, times }
}

export const isBlockedSlot = async ({ branchId, date, time }) => {
  const exists = await BlockedSlot.exists({
    branchId,
    date,
    $or: [{ time: null }, { time }],
  })

  return !!exists
}

