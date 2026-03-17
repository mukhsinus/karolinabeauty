// backend/src/routes/availability.routes.js
import express from "express"
import { getAvailability } from "../controllers/availability.controller.js"

const router = express.Router()

// GET /api/availability?branchId=...&date=...
router.get("/", async (req, res) => {
  const { branchId, date } = req.query

  if (!branchId || !date) {
    return res.status(400).json({
      message: "branchId and date are required"
    })
  }

  return getAvailability(req, res)
})

export default router