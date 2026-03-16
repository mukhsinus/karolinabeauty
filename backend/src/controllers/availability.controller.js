// backend/src/controllers/availability.controller.js
import { getAvailability as getAvailabilityService } from "../services/booking.service.js";

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

    /*
    VALIDATION
    */

    if (!branchId) {
      return res.status(400).json({
        message: "branchId query param required"
      });
    }

    if (!date) {
      return res.status(400).json({
        message: "date query param required"
      });
    }

    /*
    SERVICE LAYER
    */

    const slots = await getAvailabilityService(branchId, date);

    return res.status(200).json({
      success: true,
      data: slots
    });

  } catch (error) {

    console.error("availability error:", error);

    return res.status(500).json({
      message: "Server error"
    });

  }
};