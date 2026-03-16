// backend/src/services/services.routes.js
import express from "express";
import { getServices } from "../controllers/services.controller.js";

const router = express.Router();

/*
GET /api/services
*/

router.get("/", getServices);

export default router;