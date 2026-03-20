// backend/src/controllers/booking.controller.js
import { createBooking as createBookingService } from "../services/booking.service.js"
import { notifyNewBooking } from "../telegram/bot.js"

export const createBooking = async (req, res) => {

  try {

    const {
      branchId,
      serviceId,
      serviceName,
      serviceLevel,
      price,
      date,
      time,
      name,
      phone,
      notes
    } = req.body

    if (!branchId || !serviceId || !date || !time || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      })
    }

    const booking = await createBookingService({
      branchId,
      serviceId,
      serviceName,
      serviceLevel,
      price,
      date,
      time,
      name,
      phone,
      notes
    })

    await notifyNewBooking(booking)

    return res.status(201).json({
      success: true,
      data: booking
    })

  } catch (error) {

    console.error("createBooking controller error:", error)

    if (error.code === "BRANCH_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Branch not found"
      })
    }

    if (error.code === "SERVICE_NOT_AVAILABLE") {
      return res.status(400).json({
        success: false,
        message: "Service not available"
      })
    }

    if (error.code === "SLOT_BOOKED") {
      return res.status(409).json({
        success: false,
        message: "Time slot already booked"
      })
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })

  }

}