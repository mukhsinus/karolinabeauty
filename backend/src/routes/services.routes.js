// backend/src/routes/services.routes.js
import express from "express"
import Service from "../models/Service.js"

const router = express.Router()

router.get("/", async (req, res) => {

  try {

    const services = await Service.find({
      isActive: true
    }).lean()

    res.json(services)

  } catch (error) {

    console.error(error)

    res.status(500).json({
      message: "Failed to load services"
    })

  }

})

export default router