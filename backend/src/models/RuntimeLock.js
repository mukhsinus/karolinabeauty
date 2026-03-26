import mongoose from "mongoose"

const RuntimeLockSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    ownerId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
)

// TTL cleanup for expired locks (best-effort; not relied on for correctness)
RuntimeLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model("RuntimeLock", RuntimeLockSchema)

