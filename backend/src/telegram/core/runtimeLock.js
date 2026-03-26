import os from "os"
import RuntimeLock from "../../models/RuntimeLock.js"

const DEFAULT_TTL_SEC = 55

const getOwnerId = () => {
  const instance = process.env.INSTANCE_ID || process.env.RAILWAY_REPLICA_ID || ""
  const host = os.hostname()
  return `${instance || host}:${process.pid}`
}

export const acquireRuntimeLock = async ({ key, ttlSec = DEFAULT_TTL_SEC }) => {
  const ownerId = getOwnerId()
  const ttlMs = Math.max(10, Number(ttlSec) || DEFAULT_TTL_SEC) * 1000
  const now = new Date()
  const expiresAt = new Date(now.getTime() + ttlMs)

  // 1) Renew if we already own it
  const renewed = await RuntimeLock.findOneAndUpdate(
    { key, ownerId },
    { $set: { expiresAt } },
    { new: true }
  ).lean()
  if (renewed) return { acquired: true, ownerId, expiresAt }

  // 2) Take over if expired
  const taken = await RuntimeLock.findOneAndUpdate(
    { key, expiresAt: { $lte: now } },
    { $set: { ownerId, expiresAt } },
    { new: true }
  ).lean()
  if (taken) return { acquired: true, ownerId, expiresAt }

  // 3) Create if missing
  try {
    await RuntimeLock.create({ key, ownerId, expiresAt })
    return { acquired: true, ownerId, expiresAt }
  } catch (e) {
    // duplicate key => someone else holds it
    return { acquired: false, ownerId, expiresAt: null }
  }
}

export const renewRuntimeLock = async ({ key, ttlSec = DEFAULT_TTL_SEC }) => {
  const ownerId = getOwnerId()
  const ttlMs = Math.max(10, Number(ttlSec) || DEFAULT_TTL_SEC) * 1000
  const now = new Date()
  const expiresAt = new Date(now.getTime() + ttlMs)

  const res = await RuntimeLock.updateOne(
    { key, ownerId },
    { $set: { expiresAt } }
  )

  return { ok: Boolean(res?.matchedCount || res?.n), ownerId, expiresAt }
}

export const releaseRuntimeLock = async ({ key }) => {
  const ownerId = getOwnerId()
  try {
    await RuntimeLock.deleteOne({ key, ownerId })
  } catch {}
}

