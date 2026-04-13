// backend/src/server.js
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"

import bookingRoutes from "./routes/booking.routes.js"
import availabilityRoutes from "./routes/availability.routes.js"
import servicesRoutes from "./routes/services.routes.js"
import branchesRoutes from "./routes/branches.routes.js"

import { startBot, stopBot } from "./telegram/bot.js"

import adminRoutes from "./routes/admin.routes.js"

dotenv.config()

const app = express()
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI

/** Production + env + local dev (Railway: set CORS_ORIGIN for extra origins). */
const productionOrigins = [
  "https://karolinabeauty.uz",
  "https://www.karolinabeauty.uz",
]

const defaultLocalOrigins = [
  "http://localhost:8080",
  "http://localhost:3000",
  "http://localhost:5173",
]

const envOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean)
  : []

const allowedOrigins = [
  ...new Set([...productionOrigins, ...envOrigins, ...defaultLocalOrigins]),
]

// CORS must run before route handlers
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      console.warn("[CORS] Blocked origin:", origin)
      return callback(null, false)
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

app.use(express.json())

app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

// Primary API (frontend: VITE_API_URL = https://host/api → /api/services, /api/branches)
app.use("/api/bookings", bookingRoutes)
app.use("/api/availability", availabilityRoutes)
app.use("/api/services", servicesRoutes)
app.use("/api/branches", branchesRoutes)
app.use("/api/admin", adminRoutes)

// Aliases when VITE_API_URL points at API root without /api (fixes 404 on /services, /branches)
app.use("/services", servicesRoutes)
app.use("/branches", branchesRoutes)

app.use((err, req, res, next) => {
  console.error("Server error:", err)
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  })
})

const PORT = Number(process.env.PORT) || 4000
const HOST = "0.0.0.0"

const REGISTERED_ROUTES = [
  "GET /health",
  "GET /api/services  (JSON array)",
  "GET /api/branches  (JSON array)",
  "GET /services       (alias → same as /api/services)",
  "GET /branches       (alias → same as /api/branches)",
  "GET /api/availability",
  "POST /api/bookings",
  "PATCH /api/admin/*",
]

if (!mongoUri) {
  console.error(
    "Mongo connection error: Missing MONGO_URI (or MONGODB_URI) in environment variables"
  )
  process.exit(1)
}

if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
  console.error(
    "Mongo connection error: Invalid Mongo URI scheme. Expected mongodb:// or mongodb+srv://"
  )
  process.exit(1)
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("MongoDB connected")

    if (process.env.ENABLE_BOT === "true") {
      console.log("Starting Telegram bot...")
      startBot()
    } else {
      console.warn("Telegram bot disabled")
    }

    app.listen(PORT, HOST, () => {
      console.log(`API listening on http://${HOST}:${PORT} (PORT from env: ${process.env.PORT ?? "default 4000"})`)
      console.log("Registered routes:")
      REGISTERED_ROUTES.forEach((line) => console.log("  ", line))
    })
  })
  .catch((err) => {
    console.error("Mongo connection error:", err)
    process.exit(1)
  })

process.on("SIGINT", async () => {
  console.log("Shutting down server...")

  try {
    await mongoose.connection.close()
    stopBot()
  } catch (err) {
    console.error("Shutdown error:", err)
  }

  process.exit(0)
})
