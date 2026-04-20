// backend/scripts/seedServices.js
import mongoose from "mongoose"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

import Service from "../src/models/Service.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, "../.env") })

const CONNECT_OPTS = {
  retryWrites: true,
  w: "majority",
}

async function connectWithRetry(uri, attempt = 1) {
  console.log("Connecting to Mongo...")
  try {
    await mongoose.connect(uri, CONNECT_OPTS)
    console.log("Mongo connected")
    console.log("Connected to Mongo")
  } catch (err) {
    console.error("Mongo connection error (full):", err)
    if (attempt < 2) {
      console.log("Retrying connection once...")
      await new Promise((r) => setTimeout(r, 1000))
      return connectWithRetry(uri, attempt + 1)
    }
    throw err
  }
}

const servicesData = [

/* ================= LASHES ================= */

{
  nameKey: "services.classic_extension",
  category: "lashes",
  duration: 120,
  prices: [
    { level: "master", price: 250000 },
    { level: "top", price: 350000 },
    { level: "premium", price: 400000 }
  ]
},
{
  nameKey: "services.led_extension",
  category: "lashes",
  duration: 120,
  prices: [
    { level: "master", price: 300000 },
    { level: "top", price: 400000 }
  ]
},

{
  nameKey: "services.classic",
  category: "lashes",
  duration: 120,
  prices: [{ level: "premium", price: 400000 }]
},
{
  nameKey: "services.lashes_2_3d",
  category: "lashes",
  duration: 150,
  prices: [{ level: "premium", price: 500000 }]
},
{
  nameKey: "services.author_effect",
  category: "lashes",
  duration: 150,
  prices: [{ level: "premium", price: 550000 }]
},
{
  nameKey: "services.lashes_4_6d",
  category: "lashes",
  duration: 180,
  prices: [{ level: "premium", price: 600000 }]
},

{
  nameKey: "services.lash_removal",
  category: "lashes",
  duration: 30,
  prices: [
    { level: "master", price: 50000 },
    { level: "top", price: 50000 },
    { level: "premium", price: 100000 }
  ]
},

{
  nameKey: "services.lash_lamination",
  category: "lashes",
  duration: 60,
  prices: [
    { level: "promo", price: 150000 },
    { level: "premium", price: 300000 }
  ]
},
{
  nameKey: "services.lash_lamination_plus",
  category: "lashes",
  duration: 75,
  prices: [{ level: "promo", price: 200000 }]
},

/* ================= BROWS ================= */

{
  nameKey: "services.brow_set",
  category: "brows",
  duration: 90,
  prices: [{ level: "premium", price: 350000 }]
},

{
  nameKey: "services.brow_lamination",
  category: "brows",
  duration: 60,
  prices: [{ level: "master", price: 100000 }]
},

{
  nameKey: "services.brow_architecture",
  category: "brows",
  duration: 45,
  prices: [{ level: "master", price: 100000 }]
},
{
  nameKey: "services.brow_coloring",
  category: "brows",
  duration: 45,
  prices: [{ level: "master", price: 100000 }]
},
{
  nameKey: "services.brow_muslim",
  category: "brows",
  duration: 45,
  prices: [{ level: "master", price: 100000 }]
},

/* ================= NAILS ================= */

{
  nameKey: "services.manicure",
  category: "nails",
  duration: 60,
  prices: [{ level: "master", price: 170000 }]
},
{
  nameKey: "services.manicure_plus",
  category: "nails",
  duration: 75,
  prices: [{ level: "master", price: 250000 }]
},
{
  nameKey: "services.pedicure",
  category: "nails",
  duration: 60,
  prices: [{ level: "master", price: 190000 }]
},
{
  nameKey: "services.pedicure_plus",
  category: "nails",
  duration: 75,
  prices: [{ level: "master", price: 250000 }]
},

{
  nameKey: "services.combo_four_hands",
  category: "nails",
  duration: 120,
  prices: [{ level: "master", price: 400000 }]
},

{
  nameKey: "services.japanese_manicure",
  category: "nails",
  duration: 60,
  prices: [{ level: "master", price: 250000 }]
},
{
  nameKey: "services.japanese_pedicure",
  category: "nails",
  duration: 60,
  prices: [{ level: "master", price: 250000 }]
},
{
  nameKey: "services.japanese_combo",
  category: "nails",
  duration: 120,
  prices: [{ level: "master", price: 400000 }]
},

{
  nameKey: "services.nail_removal",
  category: "nails",
  duration: 30,
  prices: [{ level: "master", price: 40000 }]
},
{
  nameKey: "services.designs",
  category: "nails",
  duration: 30,
  prices: [{ level: "master", price: 50000 }]
},
{
  nameKey: "services.french",
  category: "nails",
  duration: 30,
  prices: [{ level: "master", price: 50000 }]
},
{
  nameKey: "services.vtirka",
  category: "nails",
  duration: 30,
  prices: [{ level: "master", price: 50000 }]
},
{
  nameKey: "services.nail_repair",
  category: "nails",
  duration: 20,
  prices: [{ level: "master", price: 15000 }]
},
{
  nameKey: "services.paraffin_spa",
  category: "nails",
  duration: 30,
  prices: [{ level: "master", price: 50000 }]
},
{
  nameKey: "services.smart_oil_spa",
  category: "nails",
  duration: 30,
  prices: [{ level: "master", price: 50000 }]
},

// ✅ НОВАЯ УСЛУГА
{
  nameKey: "services.onycholysis_cleaning",
  category: "nails",
  duration: 30,
  prices: [{ level: "master", price: 100000 }]
},

/* ================= HAIR ================= */
// (без изменений)

{
  nameKey: "services.hair_100g_work",
  category: "hair",
  duration: 180,
  currency: "USD",
  prices: [{ level: "master", price: 100 }]
},

{
  nameKey: "services.hair_40_45",
  category: "hair",
  duration: 240,
  currency: "USD",
  prices: [{ level: "master", price: 200 }]
},
{
  nameKey: "services.hair_50_55",
  category: "hair",
  duration: 240,
  currency: "USD",
  prices: [{ level: "master", price: 220 }]
},
{
  nameKey: "services.hair_60_65",
  category: "hair",
  duration: 240,
  currency: "USD",
  prices: [{ level: "master", price: 240 }]
},
{
  nameKey: "services.hair_70_75",
  category: "hair",
  duration: 240,
  currency: "USD",
  prices: [{ level: "master", price: 260 }]
},
{
  nameKey: "services.hair_80_85",
  category: "hair",
  duration: 240,
  currency: "USD",
  prices: [{ level: "master", price: 300 }]
},

{
  nameKey: "services.bio_60_70",
  category: "hair",
  duration: 180,
  currency: "USD",
  prices: [{ level: "master", price: 90 }]
},
{
  nameKey: "services.bio_80_90",
  category: "hair",
  duration: 180,
  currency: "USD",
  prices: [{ level: "master", price: 100 }]
},

/* ================= PERMANENT ================= */

{
  nameKey: "services.permanent_lips",
  category: "permanent",
  duration: 120,
  prices: [{ level: "master", price: 850000 }]
},
{
  nameKey: "services.permanent_brows",
  category: "permanent",
  duration: 120,
  prices: [{ level: "master", price: 850000 }]
},
{
  nameKey: "services.interlash",
  category: "permanent",
  duration: 120,
  prices: [{ level: "master", price: 800000 }]
},

/* ================= REMOVAL ================= */

{
  nameKey: "services.laser_removal",
  category: "removal",
  duration: 60,
  prices: [{ level: "master", price: 400000 }]
},
{
  nameKey: "services.remover_removal",
  category: "removal",
  duration: 60,
  prices: [{ level: "master", price: 300000 }]
}

]

async function seed() {
  try {
    console.log("MONGO URI:", process.env.MONGODB_URI?.slice(0, 30))

    const uri = process.env.MONGODB_URI || process.env.MONGO_URI
    if (
      !uri ||
      typeof uri !== "string" ||
      (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://"))
    ) {
      throw new Error(
        "MONGODB_URI (or MONGO_URI) is missing or invalid. Expected mongodb:// or mongodb+srv://"
      )
    }

    await connectWithRetry(uri)

    if (!Array.isArray(servicesData) || servicesData.length === 0) {
      throw new Error("servicesData is empty — nothing to insert")
    }
    console.log("Services to insert:", servicesData.length)

    console.log("Deleting old services...")
    await Service.deleteMany({})

    console.log("Seeding services...")
    try {
      await Service.insertMany(servicesData)
    } catch (insertErr) {
      console.error("insertMany failed (full error):", insertErr)
      throw insertErr
    }

    console.log(`Inserted ${servicesData.length} services`)

    const count = await Service.countDocuments()
    console.log("Total services in DB:", count)
    if (count === 0) {
      throw new Error("Seed finished but Service.countDocuments() is 0")
    }

    await mongoose.connection.close()
    console.log("Mongo connection closed")
    process.exit(0)
  } catch (error) {
    console.error("Seed failed (full error):", error)
    try {
      await mongoose.connection.close()
    } catch (_) {
      // ignore
    }
    process.exit(1)
  }
}

seed()