// src/telegram/services/api.service.js

import Service from "../../models/Service.js"
import Booking from "../../models/Booking.js"
import Branch from "../../models/Branch.js"

const BUSINESS_TZ =
  process.env.BUSINESS_TIMEZONE ||
  process.env.TZ ||
  // default for this project/business (change via env in production)
  "Asia/Tashkent"

const toYMDInTZ = (d, timeZone = BUSINESS_TZ) => {
  try {
    return new Intl.DateTimeFormat("sv-SE", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date(d))
  } catch {
    return new Date(d).toISOString().slice(0, 10)
  }
}

// ================= BOOKINGS =================

export const getTodayBookings = async () => {
  try {
    const today = toYMDInTZ(new Date())

    return await Booking.find({
      date: today,
      status: "confirmed"
    })
      .sort({ time: 1 })
      .lean()

  } catch (error) {
    console.error("getTodayBookings error:", error)
    throw error
  }
}

// ================= SERVICES =================

export const getCategories = async () => {
  try {
    return await Service.distinct("category", {
      isActive: true
    })
  } catch (error) {
    console.error("getCategories error:", error)
    throw error
  }
}

export const getServicesByCategory = async (category) => {
  try {
    return await Service.find({
      category,
      isActive: true
    }).lean()
  } catch (error) {
    console.error("getServicesByCategory error:", error)
    throw error
  }
}

export const getServiceById = async (id) => {
  try {
    return await Service.findById(id).lean()
  } catch (error) {
    console.error("getServiceById error:", error)
    throw error
  }
}

export const updateServicePrice = async (id, price) => {
  try {
    const updated = await Service.findByIdAndUpdate(
      id,
      { price },
      { new: true }
    ).lean()

    if (!updated) {
      throw new Error("SERVICE_NOT_FOUND")
    }

    return updated
  } catch (error) {
    console.error("updateServicePrice error:", error)
    throw error
  }
}

// ================= BRANCHES =================

export const getBranches = async () => {
  try {
    return await Branch.find({
      isActive: true
    }).lean()
  } catch (error) {
    console.error("getBranches error:", error)
    throw error
  }
}

export const updateBranchAddress = async (id, address) => {
  try {
    const updated = await Branch.findByIdAndUpdate(
      id,
      { address },
      { new: true }
    ).lean()

    if (!updated) {
      throw new Error("BRANCH_NOT_FOUND")
    }

    return updated
  } catch (error) {
    console.error("updateBranchAddress error:", error)
    throw error
  }
}

export const updateBranchHours = async (id, hours) => {
  try {
    const updated = await Branch.findByIdAndUpdate(
      id,
      {
        workingHoursWeekdays: hours
      },
      { new: true }
    ).lean()

    if (!updated) {
      throw new Error("BRANCH_NOT_FOUND")
    }

    return updated
  } catch (error) {
    console.error("updateBranchHours error:", error)
    throw error
  }
}