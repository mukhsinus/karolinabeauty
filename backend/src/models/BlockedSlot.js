// backend/src/models/BlockedSlot.js

import mongoose from "mongoose"

const BlockedSlotSchema = new mongoose.Schema(
  {
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

    // optional: if absent/null => full-day block
    time: {
      type: String,
      trim: true,
      default: null,
      match: /^\d{2}:\d{2}$/,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Unique per specific time block (time exists)
BlockedSlotSchema.index(
  { branchId: 1, date: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: { time: { $type: "string" } },
  }
)

// Only one full-day block per date (time is null)
BlockedSlotSchema.index(
  { branchId: 1, date: 1 },
  {
    unique: true,
    partialFilterExpression: { time: null },
  }
)

export default mongoose.model("BlockedSlot", BlockedSlotSchema)

