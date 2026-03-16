// backend/src/controllers/services.controller.js
import Service from "../models/Service.js";

/*
GET /api/services

Возвращает все активные услуги
*/

export const getServices = async (req, res) => {
  try {

    const services = await Service.find({
      isActive: true
    }).lean();

    return res.json({
      success: true,
      data: services
    });

  } catch (error) {

    console.error("services error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
};