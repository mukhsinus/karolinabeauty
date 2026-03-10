// backend/src/controllers/availability.controller.js
import Booking from "../models/Booking.js";

export const createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      serviceName,
      price,
      date,
      time,
      name,
      phone,
    } = req.body;

    if (!serviceId || !date || !time || !name || !phone) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const existing = await Booking.findOne({ date, time });

    if (existing) {
      return res.status(409).json({
        message: "Slot already booked",
      });
    }

    const booking = await Booking.create({
      serviceId,
      serviceName,
      price,
      date,
      time,
      name,
      phone,
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(409).json({
        message: "Slot already booked",
      });
    }

    res.status(500).json({
      message: "Server error",
    });
  }
};