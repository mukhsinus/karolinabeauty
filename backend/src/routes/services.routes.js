// backend/src/routes/services.routes.js
import express from "express"
import Service from "../models/Service.js"

const router = express.Router()

// GET /api/services
router.get("/", async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .select("_id nameKey category prices duration isFrom isPromo")
      .lean()

    return res.json(services)
  } catch (error) {
    console.error("GET /services error:", error)

    return res.status(500).json({
      message: "Failed to load services"
    })
  }
})

export default router