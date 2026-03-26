// backend/src/controllers/availability.controller.js

import { getAvailability as getAvailabilityService } from "../services/booking.service.js";

/*
GET /availability?branchId=...&serviceId=...&serviceLevel=...&date=YYYY-MM-DD

Returns:
[
  "10:00",
  "11:30"
]
*/

export const getAvailability = async (req, res) => {

  try {

    const {
      branchId,
      serviceId,
      serviceLevel,
      date
    } = req.query;

    /*
    VALIDATION
    */

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: "branchId query param required"
      });
    }

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "serviceId query param required"
      });
    }

    if (!serviceLevel) {
      return res.status(400).json({
        success: false,
        message: "serviceLevel query param required"
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date query param required"
      });
    }

    /*
    SERVICE LAYER
    */

    const slots = await getAvailabilityService(
      branchId,
      serviceId,
      serviceLevel,
      date
    );

    return res.status(200).json({
      success: true,
      data: slots
    });

  } catch (error) {

    console.error("availability error:", error);

    if (error.message.includes("required")) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};