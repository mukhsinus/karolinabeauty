// backend/src/models/Branch.js
import mongoose from "mongoose"

const BranchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    /** Stable id for rules (e.g. yunusabad, chilanzar) — do not use display name */
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },

    address: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      trim: true
    },

    workingHoursWeekdays: {
      type: String,
      default: "09:00 - 21:00"
    },

    workingHoursWeekend: {
      type: String,
      default: "10:00 - 22:00"
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)


BranchSchema.index({ name: 1 })
BranchSchema.index({ isActive: 1 })

export default mongoose.model("Branch", BranchSchema)