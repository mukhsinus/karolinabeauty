// backend/scripts/seedBranches.js
import mongoose from "mongoose"
import dotenv from "dotenv"

import Branch from "../src/models/Branch.js"

dotenv.config()

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI

const branchesData = [
  {
    name: "Чиланзар",
    address: "ул. Фурката 15/1",
    phone: "+998909120026",
    workingHoursWeekdays: "09:00 - 21:00",
    workingHoursWeekend: "10:00 - 22:00",
    isActive: true
  },
  {
    name: "Юнусабад",
    address: "Юнусабад 14 квартал, дом 1",
    phone: "+998949130026",
    workingHoursWeekdays: "09:00 - 21:00",
    workingHoursWeekend: "10:00 - 22:00",
    isActive: true
  }
]

const seedBranches = async () => {
  if (!MONGO_URI) {
    throw new Error("Missing MONGO_URI (or MONGODB_URI) in environment")
  }

  await mongoose.connect(MONGO_URI)
  console.log("Mongo connected")

  try {
    for (const branch of branchesData) {
      await Branch.updateOne(
        { name: branch.name },
        { $set: branch },
        { upsert: true }
      )
    }

    const total = await Branch.countDocuments()
    console.log(`Branches upserted. Total branches in DB: ${total}`)
  } finally {
    await mongoose.disconnect()
    console.log("Mongo disconnected")
  }
}

seedBranches().catch((err) => {
  console.error("Seed branches error:", err.message)
  process.exit(1)
})
