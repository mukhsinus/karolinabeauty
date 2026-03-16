// backend/src/routes/booking.routes.js
import express from "express";
import { createBooking } from "../controllers/booking.controller.js";

const router = express.Router();


router.post("/", createBooking);

/*
В будущем здесь будут дополнительные маршруты:

POST   /api/bookings        → create booking
PATCH  /api/bookings/:id    → cancel booking
GET    /api/bookings        → admin list bookings
*/

export default router;