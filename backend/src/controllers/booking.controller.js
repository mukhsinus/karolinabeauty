// backend/src/controllers/booking.controller.js

import Booking from "../src/models/booking.js";

/*
POST /bookings

Body:
{
  branchId,
  serviceId,
  serviceName,
  serviceDuration,
  price,
  date,
  time,
  name,
  phone
}
*/

export const createBooking = async (req, res) => {
  try {

    const {
      branchId,
      serviceId,
      serviceName,
      serviceDuration,
      price,
      date,
      time,
      name,
      phone,
    } = req.body;

    // basic validation
    if (
      !branchId ||
      !serviceId ||
      !serviceName ||
      !serviceDuration ||
      !price ||
      !date ||
      !time ||
      !name ||
      !phone
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    /*
    Проверяем занятость слота
    ТОЛЬКО в рамках филиала
    */

    const existing = await Booking.findOne({
      branchId,
      date,
      time,
      status: { $ne: "cancelled" }
    });

    if (existing) {
      return res.status(409).json({
        message: "Slot already booked",
      });
    }

    const booking = await Booking.create({
      branchId,
      serviceId,
      serviceName,
      serviceDuration,
      price,
      date,
      time,
      name,
      phone,
      status: "confirmed"
    });

    return res.status(201).json(booking);

  } catch (error) {

    console.error("create booking error:", error);

    /*
    Mongo duplicate key protection
    */

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Slot already booked",
      });
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
};