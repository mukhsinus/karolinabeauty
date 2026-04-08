// backend/src/models/Master.js
import mongoose from "mongoose"

const MasterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },
    /** Empty = can perform all services at this branch */
    serviceIds: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
)

MasterSchema.index({ branchId: 1, isActive: 1 })

export default mongoose.model("Master", MasterSchema)
