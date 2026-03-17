// backend/src/routes/branches.routes.js
import express from "express"
import Branch from "../models/Branch.js"

const router = express.Router()

// GET /api/branches
router.get("/", async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true })
      .select("_id name address workingHoursWeekdays")
      .lean()

    return res.json(branches)
  } catch (error) {
    console.error("GET /branches error:", error)
    return res.status(500).json({
      message: "Failed to load branches"
    })
  }
})

export default router