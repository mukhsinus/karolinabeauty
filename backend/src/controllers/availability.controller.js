// backend/src/controllers/availability.controller.js

import Booking from "../src/models/booking.js";

/*
GET /availability?branchId=...&date=YYYY-MM-DD

Returns:
[
  "2026-03-12-10:00",
  "2026-03-12-11:30"
]
*/

export const getAvailability = async (req, res) => {
  try {

    const { branchId, date } = req.query;

    if (!branchId) {
      return res.status(400).json({
        message: "branchId query param required",
      });
    }

    if (!date) {
      return res.status(400).json({
        message: "date query param required",
      });
    }

    // ищем только активные записи
    const bookings = await Booking.find(
      {
        branchId,
        date,
        status: { $ne: "cancelled" }
      },
      {
        time: 1,
        _id: 0
      }
    ).lean();

    /*
    Превращаем в формат
    YYYY-MM-DD-HH:mm
    */

    const takenSlots = bookings.map(
      (b) => `${date}-${b.time}`
    );

    return res.json(takenSlots);

  } catch (error) {

    console.error("availability error:", error);

    return res.status(500).json({
      message: "Server error",
    });

  }
};