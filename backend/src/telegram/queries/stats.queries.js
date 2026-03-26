// backend/src/telegram/queries/stats.queries.js

import mongoose from "mongoose"
import Booking from "../../models/Booking.js"

const toYMDLocal = (d) => {
  const x = new Date(d)
  const yyyy = x.getFullYear()
  const mm = String(x.getMonth() + 1).padStart(2, "0")
  const dd = String(x.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

const addDaysLocal = (ymd, days) => {
  const [y, m, d] = ymd.split("-").map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  return toYMDLocal(dt)
}

export const getStatsRange = (period) => {
  const start = toYMDLocal(new Date())
  if (period === "next7") {
    const end = addDaysLocal(start, 6)
    return { start, end }
  }
  return { start, end: start }
}

export const getTotals = async ({ start, end }) => {
  const agg = await Booking.aggregate([
    {
      $match: {
        status: "confirmed",
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        revenue: { $sum: "$price" },
      },
    },
    {
      $project: { _id: 0, count: 1, revenue: 1 },
    },
  ])

  return agg[0] || { count: 0, revenue: 0 }
}

export const getGroupedByBranch = async ({ start, end }) => {
  return await Booking.aggregate([
    {
      $match: {
        status: "confirmed",
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$branchId",
        count: { $sum: 1 },
        revenue: { $sum: "$price" },
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "_id",
        foreignField: "_id",
        as: "branch",
      },
    },
    {
      $addFields: {
        branchName: { $ifNull: [{ $arrayElemAt: ["$branch.name", 0] }, "—"] },
      },
    },
    { $project: { _id: 0, branchId: "$_id", branchName: 1, count: 1, revenue: 1 } },
    { $sort: { revenue: -1, count: -1, branchName: 1 } },
  ])
}

export const getGroupedByService = async ({ start, end }) => {
  // serviceId in Booking is a string (mongoId), serviceName is a translation key
  return await Booking.aggregate([
    {
      $match: {
        status: "confirmed",
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          serviceId: "$serviceId",
          serviceName: "$serviceName",
          serviceLevel: "$serviceLevel",
        },
        count: { $sum: 1 },
        revenue: { $sum: "$price" },
      },
    },
    {
      $project: {
        _id: 0,
        serviceId: "$_id.serviceId",
        serviceName: "$_id.serviceName",
        serviceLevel: "$_id.serviceLevel",
        count: 1,
        revenue: 1,
      },
    },
    { $sort: { revenue: -1, count: -1, serviceName: 1, serviceLevel: 1 } },
  ])
}

