// backend/src/server.js

import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"

import bookingRoutes from "./routes/booking.routes.js"
import availabilityRoutes from "./routes/availability.routes.js"
import servicesRoutes from "./routes/services.routes.js"

import { startBot, stopBot } from "./telegram/bot.js"

dotenv.config()

const app = express()

/*
--------------------------------
MIDDLEWARE
--------------------------------
*/

app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "http://localhost:5173",
      "http://127.0.0.1:8080",
      "http://127.0.0.1:5173"
    ],
    credentials: true
  })
)

app.use(express.json())

/*
--------------------------------
HEALTH CHECK
--------------------------------
*/

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "karolina-beauty-api"
  })
})

/*
--------------------------------
API ROUTES
--------------------------------
*/

app.use("/api/bookings", bookingRoutes)
app.use("/api/availability", availabilityRoutes)
app.use("/api/services", servicesRoutes)

/*
--------------------------------
ERROR HANDLER
--------------------------------
*/

app.use((err, req, res, next) => {

  console.error("Server error:", err)

  res.status(err.status || 500).json({
    message: err.message || "Internal server error"
  })

})

/*
--------------------------------
SERVER INIT
--------------------------------
*/

const PORT = process.env.PORT || 4000

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {

    console.log("MongoDB connected")

    /*
    START TELEGRAM BOT
    */

    if (process.env.TELEGRAM_BOT_TOKEN) {

      startBot()

    } else {

      console.warn("Telegram bot not started (no TELEGRAM_BOT_TOKEN)")

    }

    /*
    START API SERVER
    */

    app.listen(PORT, () => {

      console.log(`API running on port ${PORT}`)

    })

  })
  .catch((err) => {

    console.error("Mongo connection error:", err)

    process.exit(1)

  })

/*
--------------------------------
GRACEFUL SHUTDOWN
--------------------------------
*/

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