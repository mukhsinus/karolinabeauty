// src/telegram/services/api.service.js

import Service from "../../models/Service.js"
import Booking from "../../models/Booking.js"
import Branch from "../../models/Branch.js"
import { listActiveServices } from "../../services/services.service.js"

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

// ================= SERVICES (same dataset as GET /api/services) =================

export const getCategories = async () => {
  try {
    const rows = await listActiveServices()
    const set = new Set(
      rows.map((s) => s.category).filter((c) => c != null && String(c).length > 0)
    )
    return [...set].sort((a, b) => String(a).localeCompare(String(b)))
  } catch (error) {
    console.error("getCategories error:", error)
    throw error
  }
}

export const getServicesByCategory = async (category) => {
  try {
    const c = String(category || "")
    const rows = await listActiveServices()
    return rows.filter((s) => String(s.category) === c)
  } catch (error) {
    console.error("getServicesByCategory error:", error)
    throw error
  }
}

/** Active service by id from the public catalog (includes prices, currency). */
export const getCatalogServiceById = async (id) => {
  try {
    if (!id) return null
    const want = String(id)
    const rows = await listActiveServices()
    return rows.find((s) => String(s._id) === want) || null
  } catch (error) {
    console.error("getCatalogServiceById error:", error)
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
    const service = await Service.findById(id)
    if (!service) {
      throw new Error("SERVICE_NOT_FOUND")
    }
    if (!Array.isArray(service.prices) || service.prices.length === 0) {
      throw new Error("SERVICE_NO_PRICES")
    }
    const idx = service.prices.findIndex((p) => p.level === "master")
    const target = idx >= 0 ? idx : 0
    service.prices[target].price = price
    await service.save()
    return service.toObject()
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
      { returnDocument: "after" }
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
      { returnDocument: "after" }
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