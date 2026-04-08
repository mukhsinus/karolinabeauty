// backend/src/models/MasterAvailability.js
import mongoose from "mongoose"

const MasterAvailabilitySchema = new mongoose.Schema(
  {
    masterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Master",
      required: true,
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["override", "default"],
      required: true,
      index: true,
    },
  },
  { timestamps: true }
)

MasterAvailabilitySchema.index(
  { branchId: 1, date: 1, masterId: 1, type: 1 },
  { name: "master_availability_lookup" }
)

export default mongoose.model("MasterAvailability", MasterAvailabilitySchema)
