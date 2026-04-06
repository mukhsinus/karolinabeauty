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

export const blockDay = async ({ branchId, date }) => {
  const doc = await BlockedSlot.findOneAndUpdate(
    { branchId, date, time: null },
    { $setOnInsert: { branchId, date, time: null } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  )
  return doc
}

export const blockTime = async ({ branchId, date, time }) => {
  const doc = await BlockedSlot.findOneAndUpdate(
    { branchId, date, time },
    { $setOnInsert: { branchId, date, time } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  )
  return doc
}

export const unblockDay = async ({ branchId, date }) => {
  return await BlockedSlot.deleteOne({ branchId, date, time: null })
}

export const unblockTime = async ({ branchId, date, time }) => {
  return await BlockedSlot.deleteOne({ branchId, date, time })
}

