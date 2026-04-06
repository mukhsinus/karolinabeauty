// backend/src/routes/branches.routes.js
import express from "express"
import Branch from "../models/Branch.js"

const router = express.Router()

// GET /api/branches
router.get("/", async (req, res) => {
  try {
    let branches = await Branch.find({ isActive: true })
      .select("_id name address workingHoursWeekdays")
      .sort({ name: 1 })
      .lean()

    // Backward-compatible fallback for older data where isActive
    // may be missing/false for all documents.
    if (!branches.length) {
      branches = await Branch.find({})
        .select("_id name address workingHoursWeekdays")
        .sort({ name: 1 })
        .lean()
    }

    return res.json(branches)
  } catch (error) {
    console.error("GET /branches error:", error)
    return res.status(500).json({
      message: "Failed to load branches"
    })
  }
})

export default router