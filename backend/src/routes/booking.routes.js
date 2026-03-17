// backend/src/routes/booking.routes.js
import express from "express"
import { createBooking } from "../controllers/booking.controller.js"
import Booking from "../models/Booking.js"

const router = express.Router()

// CREATE booking
router.post("/", createBooking)

// ADMIN: GET bookings list
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ date: -1, time: -1 })
      .lean()

    return res.json(bookings)
  } catch (error) {
    console.error("GET /bookings error:", error)

    return res.status(500).json({
      message: "Failed to load bookings"
    })
  }
})

// CANCEL booking
router.patch("/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    )

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      })
    }

    return res.json(booking)
  } catch (error) {
    console.error("PATCH /bookings error:", error)

    return res.status(500).json({
      message: "Failed to cancel booking"
    })
  }
})

export default router