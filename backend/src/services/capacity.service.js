// backend/src/services/capacity.service.js

import Capacity from "../models/Capacity.js"

const DEFAULT_CAPACITY = 1

export const getSlotCapacity = async ({
  branchId,
  serviceId,
  serviceLevel,
  date,
}) => {
  const doc = await Capacity.findOne({
    branchId,
    serviceId,
    serviceLevel,
    date,
  })
    .select("capacity")
    .lean()

  if (!doc) return DEFAULT_CAPACITY

  const value = Number(doc.capacity)
  return Number.isFinite(value) && value >= 1 ? value : DEFAULT_CAPACITY
}

export const upsertSlotCapacity = async ({
  branchId,
  serviceId,
  serviceLevel,
  date,
  capacity,
}) => {
  const normalized = Number(capacity)

  if (!Number.isFinite(normalized) || normalized < 1) {
    throw new Error("Capacity must be a number >= 1")
  }

  const doc = await Capacity.findOneAndUpdate(
    {
      branchId,
      serviceId,
      serviceLevel,
      date,
    },
    {
      $set: {
        capacity: Math.floor(normalized),
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  )

  return doc
}

