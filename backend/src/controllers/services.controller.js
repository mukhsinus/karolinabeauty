// backend/src/controllers/services.controller.js
import { listActiveServices } from "../services/services.service.js"

/*
GET /api/services

Возвращает все активные услуги
*/

export const getServices = async (req, res) => {
  try {
    const services = await listActiveServices()

    return res.json({
      success: true,
      data: services
    })
  } catch (error) {
    console.error("services error:", error)

    res.status(500).json({
      message: "Server error"
    })
  }
}