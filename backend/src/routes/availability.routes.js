// backend/src/routes/availability.routes.js

import express from "express";
import { getAvailability } from "../controllers/availability.controller.js";

const router = express.Router();

/*
Endpoint: GET /availability

Query params:
- branchId (required)
- date (required)

Example:
GET /availability?branchId=65f1c3c3b3c2&date=2026-03-12
*/

router.get("/", async (req, res, next) => {
  try {

    const { branchId, date } = req.query;

    if (!branchId) {
      return res.status(400).json({
        message: "branchId is required",
      });
    }

    if (!date) {
      return res.status(400).json({
        message: "date is required",
      });
    }

    return getAvailability(req, res, next);

  } catch (error) {
    next(error);
  }
});

export default router;