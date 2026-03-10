// backend/src/controllers/availability.controller.js
import Booking from "../models/Booking.js";

export const getAvailability = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "date query param required",
      });
    }

    const bookings = await Booking.find({ date });

    const takenSlots = bookings.map((b) => b.time);

    res.json(takenSlots);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};