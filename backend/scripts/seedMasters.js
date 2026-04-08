// backend/scripts/seedMasters.js
import mongoose from "mongoose"
import dotenv from "dotenv"

import Branch from "../src/models/Branch.js"
import Master from "../src/models/Master.js"

dotenv.config()

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI

const seedMasters = async () => {
  if (!MONGO_URI) {
    throw new Error("Missing MONGO_URI (or MONGODB_URI)")
  }

  await mongoose.connect(MONGO_URI)
  console.log("Mongo connected")

  try {
    const branches = await Branch.find({ isActive: true }).lean()
    let created = 0

    for (const b of branches) {
      const existing = await Master.countDocuments({ branchId: b._id })
      if (existing >= 2) continue

      const need = Math.max(0, 2 - existing)
      for (let i = 0; i < need; i++) {
        await Master.create({
          name: `Мастер ${existing + i + 1} · ${b.name}`,
          branchId: b._id,
          serviceIds: [],
          isActive: true,
        })
        created++
      }
    }

    const total = await Master.countDocuments()
    console.log(`Masters ensured (min 2 per branch). Created: ${created}. Total: ${total}`)
  } finally {
    await mongoose.disconnect()
    console.log("Mongo disconnected")
  }
}

seedMasters().catch((err) => {
  console.error("seedMasters error:", err.message)
  process.exit(1)
})
