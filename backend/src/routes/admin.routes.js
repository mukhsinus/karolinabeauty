// backend/src/routes/admin.routes.js
import express from "express"
import Service from "../models/Service.js"
import Branch from "../models/Branch.js"
import Booking from "../models/Booking.js"

const router = express.Router()

// ================= SERVICES =================

// update price
router.patch("/services/:id/price", async (req, res) => {
  try {
    const { price } = req.body

    if (typeof price !== "number") {
      return res.status(400).json({
        message: "Invalid price"
      })
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { price },
      { new: true }
    )

    if (!service) {
      return res.status(404).json({
        message: "Service not found"
      })
    }

    return res.json(service)
  } catch (error) {
    console.error("update price error:", error)

    return res.status(500).json({
      message: "Failed to update price"
    })
  }
})

// ================= BRANCH =================

// update address
router.patch("/branches/:id/address", async (req, res) => {
  try {
    const { address } = req.body

    if (!address) {
      return res.status(400).json({
        message: "Address required"
      })
    }

    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      { address },
      { new: true }
    )

    if (!branch) {
      return res.status(404).json({
        message: "Branch not found"
      })
    }

    return res.json(branch)
  } catch (error) {
    console.error("update address error:", error)

    return res.status(500).json({
      message: "Failed to update address"
    })
  }
})

// update hours
router.patch("/branches/:id/hours", async (req, res) => {
  try {
    const { hours } = req.body

    if (!hours) {
      return res.status(400).json({
        message: "Hours required"
      })
    }

    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      { workingHoursWeekdays: hours },
      { new: true }
    )

    if (!branch) {
      return res.status(404).json({
        message: "Branch not found"
      })
    }

    return res.json(branch)
  } catch (error) {
    console.error("update hours error:", error)

    return res.status(500).json({
      message: "Failed to update hours"
    })
  }
})

// ================= BOOKINGS =================

// today bookings
router.get("/bookings/today", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10)

    const bookings = await Booking.find({
      date: today,
      status: "confirmed"
    })
      .sort({ time: 1 })
      .lean()

    return res.json(bookings)
  } catch (error) {
    console.error("today bookings error:", error)

    return res.status(500).json({
      message: "Failed to load bookings"
    })
  }
})

export default router