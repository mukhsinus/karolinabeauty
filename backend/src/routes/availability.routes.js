// backend/src/routes/availability.routes.js
import express from "express";
import { getAvailability } from "../controllers/availability.controller.js";

const router = express.Router();

/*
GET /api/availability

Query:
branchId
date

Example:
GET /api/availability?branchId=65f1c3c3b3c2&date=2026-03-12
*/

router.get("/", getAvailability);

export default router;