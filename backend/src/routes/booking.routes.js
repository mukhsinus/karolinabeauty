// backend/src/routes/booking.routes.js
import express from "express";
import { createBooking } from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/", createBooking);

export default router;