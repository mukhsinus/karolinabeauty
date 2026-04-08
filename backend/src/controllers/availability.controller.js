// backend/src/controllers/availability.controller.js

import { getAvailability as getAvailabilityService } from "../services/booking.service.js"
import { addAvailabilityOverride } from "../services/availability.service.js"

const overrideSecret = process.env.AVAILABILITY_OVERRIDE_SECRET || ""

export const getAvailability = async (req, res) => {
  try {
    const { branchId, serviceId, serviceLevel, date } = req.query

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: "branchId query param required",
      })
    }

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "serviceId query param required",
      })
    }

    if (!serviceLevel) {
      return res.status(400).json({
        success: false,
        message: "serviceLevel query param required",
      })
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date query param required",
      })
    }

    const data = await getAvailabilityService(
      branchId,
      serviceId,
      serviceLevel,
      date
    )

    return res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("availability error:", error)

    if (error.message?.includes("required")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

export const postAvailabilityOverride = async (req, res) => {
  try {
    if (!overrideSecret || req.headers["x-override-secret"] !== overrideSecret) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      })
    }

    const { masterId, branchId, date, start, end } = req.body || {}

    if (!masterId || !branchId || !date || start == null || end == null) {
      return res.status(400).json({
        success: false,
        message: "masterId, branchId, date, start, end are required",
      })
    }

    const doc = await addAvailabilityOverride({
      masterId,
      branchId,
      date,
      start,
      end,
    })

    return res.status(201).json({
      success: true,
      data: doc,
    })
  } catch (error) {
    console.error("availability override error:", error)
    return res.status(400).json({
      success: false,
      message: error.message || "Bad request",
    })
  }
}
