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

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:8080", "http://localhost:3000", "http://localhost:5173"]

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
)

app.use(express.json())

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "karolina-beauty-api"
  })
})

app.use("/api/bookings", bookingRoutes)
app.use("/api/availability", availabilityRoutes)
app.use("/api/services", servicesRoutes)
app.use("/api/branches", branchesRoutes)
app.use("/api/admin", adminRoutes)

app.use((err, req, res, next) => {
  console.error("Server error:", err)
  res.status(err.status || 500).json({
    message: err.message || "Internal server error"
  })
})

const PORT = process.env.PORT || 4000

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected")

    if (process.env.ENABLE_BOT === "true") {
      console.log("Starting Telegram bot...")
      startBot()
    } else {
      console.warn("Telegram bot disabled")
    }

    app.listen(PORT, () => {
      console.log(`API running on port ${PORT}`)
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