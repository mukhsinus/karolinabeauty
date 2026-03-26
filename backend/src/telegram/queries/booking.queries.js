// backend/src/telegram/queries/booking.queries.js

import Booking from "../../models/Booking.js"

const toISODate = (d) => d.toISOString().slice(0, 10)

const startOfDay = (d) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export const getBookingById = async (bookingId) => {
  return await Booking.findById(bookingId)
    .populate("branchId", "name address")
    .lean()
}

export const getBookingsTodayPage = async ({ page = 0, limit = 5 }) => {
  const today = toISODate(new Date())

  // Fetch one extra to detect hasNext without expensive count
  const docs = await Booking.find({
    date: today,
    status: "confirmed"
  })
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

export const getBookingsNext7DaysPage = async ({ page = 0, limit = 5 }) => {
  const now = new Date()
  const start = toISODate(startOfDay(now))

  const endDate = new Date(now)
  endDate.setDate(endDate.getDate() + 7)
  const end = toISODate(startOfDay(endDate))

  const docs = await Booking.find({
    date: { $gte: start, $lte: end },
    status: "confirmed"
  })
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

