// backend/src/telegram/queries/booking.queries.js

import Booking from "../../models/Booking.js"
import Branch from "../../models/Branch.js"

const toYMDLocal = (d) => {
  const x = new Date(d)
  const yyyy = x.getFullYear()
  const mm = String(x.getMonth() + 1).padStart(2, "0")
  const dd = String(x.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

const addDaysLocal = (ymd, days) => {
  const [y, m, d] = ymd.split("-").map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  return toYMDLocal(dt)
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
  const today = toYMDLocal(new Date())

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
  const start = toYMDLocal(new Date())
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

