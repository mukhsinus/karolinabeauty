// backend/src/routes/availability.routes.js
import express from "express";
import { getAvailability } from "../controllers/availability.controller.js";

const router = express.Router();

router.get("/", getAvailability);

export default router;