// backend/src/models/Capacity.js

import mongoose from "mongoose"

const CapacitySchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },

    // keep consistent with Booking.serviceId (String)
    serviceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    serviceLevel: {
      type: String,
      required: true,
      trim: true,
      enum: ["master", "top", "premium"],
      index: true,
    },

    date: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
)

CapacitySchema.index(
  {
    branchId: 1,
    serviceId: 1,
    serviceLevel: 1,
    date: 1,
  },
  { unique: true }
)

export default mongoose.model("Capacity", CapacitySchema)

