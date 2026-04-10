// backend/src/controllers/booking.controller.js

import {
  createBooking as createBookingService
} from "../services/booking.service.js"

import { notifyNewBooking } from "../telegram/bot.js"

/*
CREATE BOOKING
*/

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

    // 🔥 ВАЖНО: добавили serviceLevel

    if (
      !branchId ||
      !serviceId ||
      !serviceLevel ||
      !date ||
      !time ||
      !name ||
      !phone
    ) {
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

    // уведомление в телеграм

    await notifyNewBooking(booking)

    return res.status(201).json({
      success: true,
      data: booking
    })

  } catch (error) {

    console.error("createBooking controller error:", error)

    // 🔥 Mongo duplicate key (главная защита)

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Time slot already booked for this level"
      })
    }

    // 🔥 ошибки из сервиса (по тексту)

    if (error.message === "Branch not found") {
      return res.status(404).json({
        success: false,
        message: error.message
      })
    }

    if (error.message === "Service not available") {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    if (error.message === "Service level is required") {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    if (error.message?.includes("Premium master level is not available")) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    if (error.message.includes("Time slot already booked")) {
      return res.status(409).json({
        success: false,
        message: error.message
      })
    }

    if (error.message === "Time slot is full") {
      return res.status(409).json({
        success: false,
        message: error.message
      })
    }

    if (error.message === "Time slot is blocked") {
      return res.status(409).json({
        success: false,
        message: error.message
      })
    }

    if (
      error.message?.includes("manually") ||
      error.message?.includes("Manual booking")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    if (error.message?.includes("VIP time not allowed")) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })

  }

}