// backend/src/telegram/actions/booking.actions.js

import {
  getBookingById,
  getActiveBranches,
  getBookingsNext7DaysPage,
  getBookingsTodayPage,
  getBookingsByDatePage
} from "../queries/booking.queries.js"

import {
  cancelBooking as cancelBookingService,
  completeBooking as completeBookingService,
  rescheduleBooking as rescheduleBookingService,
  getAvailability as getAvailabilityService
} from "../../services/booking.service.js"

export const listBookings = async ({
  type,
  page = 0,
  limit = 5,
  branchId = null,
  serviceLevel = null,
  date = null
}) => {
  const normalizedPage = Math.max(0, Number(page) || 0)
  const normalizedLimit = Math.min(10, Math.max(3, Number(limit) || 5))

  if (type === "day") {
    if (!date) throw new Error("Date is required")
    return await getBookingsByDatePage({
      date,
      page: normalizedPage,
      limit: normalizedLimit,
      branchId,
      serviceLevel
    })
  }

  if (type === "next7") {
    return await getBookingsNext7DaysPage({
      page: normalizedPage,
      limit: normalizedLimit,
      branchId,
      serviceLevel
    })
  }

  return await getBookingsTodayPage({
    page: normalizedPage,
    limit: normalizedLimit,
    branchId,
    serviceLevel
  })
}

export const listBranches = async () => {
  return await getActiveBranches()
}

export const getBookingCardData = async (bookingId) => {
  const booking = await getBookingById(bookingId)
  if (!booking) throw new Error("Booking not found")
  return booking
}

export const cancelBooking = async (bookingId) => {
  if (!bookingId) throw new Error("Booking not found")

  const booking = await getBookingById(bookingId)
  if (!booking) throw new Error("Booking not found")
  if (booking.status !== "confirmed") {
    throw new Error("Booking not active")
  }

  const updated = await cancelBookingService(bookingId)
  console.log(`[CRM] Booking cancelled: ${bookingId}`)
  return updated
}

export const completeBooking = async (bookingId) => {
  if (!bookingId) throw new Error("Booking not found")

  const booking = await getBookingById(bookingId)
  if (!booking) throw new Error("Booking not found")
  if (booking.status !== "confirmed") {
    throw new Error("Booking not active")
  }

  const updated = await completeBookingService(bookingId)
  console.log(`[CRM] Booking completed: ${bookingId}`)
  return updated
}

export const getUnavailableSlots = async ({
  branchId,
  serviceId,
  serviceLevel,
  date
}) => {
  return await getAvailabilityService(branchId, serviceId, serviceLevel, date)
}

export const rescheduleBooking = async (bookingId, { date, time }) => {
  if (!bookingId) throw new Error("Booking not found")
  if (!date || !time) throw new Error("Date and time are required")

  const booking = await getBookingById(bookingId)
  if (!booking) throw new Error("Booking not found")
  if (booking.status !== "confirmed") {
    throw new Error("Booking not active")
  }

  const updated = await rescheduleBookingService(bookingId, { date, time })
  console.log(`[CRM] Booking rescheduled: ${bookingId} -> ${date} ${time}`)
  return updated
}

