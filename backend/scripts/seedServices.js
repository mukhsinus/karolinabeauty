// backend/scripts/seedServices.js
import mongoose from "mongoose"
import dotenv from "dotenv"

import Service from "../src/models/Service.js"

dotenv.config()

const MONGO = process.env.MONGODB_URI

const servicesData = [

/* LASHES */

{ nameKey: "services.classic_extension", category: "lashes", price: 200000, duration: 120 },
{ nameKey: "services.led_extension", category: "lashes", price: 250000, duration: 120 },
{ nameKey: "services.colored_lashes", category: "lashes", price: 50000, duration: 45 },
{ nameKey: "services.lash_removal", category: "lashes", price: 50000, duration: 30 },

{ nameKey: "services.classic_extension", category: "lashes", price: 300000, duration: 120 },
{ nameKey: "services.led_extension", category: "lashes", price: 400000, duration: 120 },

{ nameKey: "services.classic", category: "lashes", price: 400000, duration: 120 },
{ nameKey: "services.lashes_2_3d", category: "lashes", price: 500000, duration: 150 },
{ nameKey: "services.author_effect", category: "lashes", price: 550000, duration: 150 },
{ nameKey: "services.lashes_4_6d", category: "lashes", price: 600000, duration: 180 },
{ nameKey: "services.removal", category: "lashes", price: 100000, duration: 30 },
{ nameKey: "services.lash_lamination", category: "lashes", price: 300000, duration: 60 },

{ nameKey: "services.lash_lamination", category: "lashes", price: 100000, duration: 60 },
{ nameKey: "services.lash_lamination_plus", category: "lashes", price: 150000, duration: 75 },

/* NAILS */

{ nameKey: "services.manicure", category: "nails", price: 170000, duration: 60 },
{ nameKey: "services.manicure_plus", category: "nails", price: 250000, duration: 75 },
{ nameKey: "services.pedicure", category: "nails", price: 190000, duration: 60 },
{ nameKey: "services.pedicure_plus", category: "nails", price: 220000, duration: 75 },
{ nameKey: "services.combo_four_hands", category: "nails", price: 400000, duration: 120 },
{ nameKey: "services.combo_promo", category: "nails", price: 290000, duration: 120 },

{ nameKey: "services.japanese_manicure", category: "nails", price: 250000, duration: 60 },
{ nameKey: "services.japanese_pedicure", category: "nails", price: 250000, duration: 60 },
{ nameKey: "services.japanese_combo", category: "nails", price: 400000, duration: 120 },

{ nameKey: "services.nail_removal", category: "nails", price: 40000, duration: 30 },
{ nameKey: "services.designs", category: "nails", price: 50000, duration: 30, isFrom: true },
{ nameKey: "services.french", category: "nails", price: 50000, duration: 30 },
{ nameKey: "services.vtirka", category: "nails", price: 50000, duration: 30 },
{ nameKey: "services.nail_repair", category: "nails", price: 15000, duration: 20, isFrom: true },
{ nameKey: "services.paraffin_spa", category: "nails", price: 50000, duration: 30 },
{ nameKey: "services.smart_oil_spa", category: "nails", price: 50000, duration: 30 },

/* BROWS */

{ 
  nameKey: "services.brow_architecture",
  category: "brows",
  price: 100000,
  duration: 45
},

{ 
  nameKey: "services.brow_correction",
  category: "brows",
  price: 100000,
  duration: 45
},

{ 
  nameKey: "services.brow_coloring",
  category: "brows",
  price: 100000,
  duration: 45
},

{ 
  nameKey: "services.brow_lamination",
  category: "brows",
  price: 100000,
  duration: 60
},

{ 
  nameKey: "services.brow_muslim",
  category: "brows",
  price: 100000,
  duration: 45
},

{ 
  nameKey: "services.brow_set",
  category: "brows",
  price: 300000,
  duration: 90
},

/* DEPILATION */

{ nameKey: "services.promo_depilation", category: "depilation", price: 250000, duration: 90 },
{ nameKey: "services.deep_bikini", category: "depilation", price: 150000, duration: 45 },
{ nameKey: "services.armpits", category: "depilation", price: 50000, duration: 20 },
{ nameKey: "services.legs_to_knee", category: "depilation", price: 100000, duration: 30 },
{ nameKey: "services.full_legs", category: "depilation", price: 150000, duration: 60 },
{ nameKey: "services.arms_to_elbow", category: "depilation", price: 60000, duration: 25 },
{ nameKey: "services.full_arms", category: "depilation", price: 90000, duration: 40 },
{ nameKey: "services.face", category: "depilation", price: 70000, duration: 30 },
{ nameKey: "services.stomach", category: "depilation", price: 60000, duration: 25 },
{ nameKey: "services.back", category: "depilation", price: 60000, duration: 30 },
{ nameKey: "services.upper_lip", category: "depilation", price: 30000, duration: 15 },

/* HAIR */

{ nameKey: "services.hair_100g_work", category: "hair", price: 650000, duration: 180 },

{ nameKey: "services.hair_40_45", category: "hair", price: 2080000, duration: 240 },
{ nameKey: "services.hair_50_55", category: "hair", price: 2340000, duration: 240 },
{ nameKey: "services.hair_60_65", category: "hair", price: 2600000, duration: 240 },
{ nameKey: "services.hair_70_75", category: "hair", price: 2860000, duration: 240 },
{ nameKey: "services.hair_80_85", category: "hair", price: 3250000, duration: 240 },

{ nameKey: "services.bio_60_70", category: "hair", price: 975000, duration: 180 },
{ nameKey: "services.bio_80_90", category: "hair", price: 1170000, duration: 180 },

/* PERMANENT */

{ nameKey: "services.permanent_lips", category: "permanent", price: 850000, duration: 120 },
{ nameKey: "services.permanent_brows", category: "permanent", price: 850000, duration: 120 },
{ nameKey: "services.interlash", category: "permanent", price: 800000, duration: 120 },

/* REMOVAL */

{ nameKey: "services.laser_removal", category: "removal", price: 400000, duration: 60 },
{ nameKey: "services.remover_removal", category: "removal", price: 300000, duration: 60 }

]


async function seed() {

  try {

    await mongoose.connect(MONGO)

    console.log("Mongo connected")

    await Service.deleteMany()

    console.log("Old services removed")

    await Service.insertMany(servicesData)

    console.log(`Inserted ${servicesData.length} services`)

    process.exit()

  } catch (error) {

    console.error(error)

    process.exit(1)

  }

}

seed()