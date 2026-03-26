// backend/src/telegram/queries/stats.queries.js

import Booking from "../../models/Booking.js"

const BUSINESS_TZ =
  process.env.BUSINESS_TIMEZONE ||
  process.env.TZ ||
  // default for this project/business (change via env in production)
  "Asia/Tashkent"

const toYMDInTZ = (d, timeZone = BUSINESS_TZ) => {
  // sv-SE reliably formats as YYYY-MM-DD
  try {
    return new Intl.DateTimeFormat("sv-SE", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date(d))
  } catch {
    const x = new Date(d)
    const yyyy = x.getFullYear()
    const mm = String(x.getMonth() + 1).padStart(2, "0")
    const dd = String(x.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }
}

const addDaysLocal = (ymd, days) => {
  const [y, m, d] = ymd.split("-").map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  return toYMDInTZ(dt)
}

export const getStatsRange = (period) => {
  const start = toYMDInTZ(new Date())
  if (period === "next7") {
    const end = addDaysLocal(start, 6)
    return { start, end }
  }
  return { start, end: start }
}

const VALID_STATUSES = ["confirmed", "completed"]

export const getTotals = async ({ start, end, branchId }) => {
  if (!branchId) return { count: 0, revenue: 0 }
  const agg = await Booking.aggregate([
    {
      $match: {
        branchId,
        status: { $in: VALID_STATUSES },
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        revenue: { $sum: { $ifNull: ["$price", 0] } },
      },
    },
    {
      $project: { _id: 0, count: 1, revenue: 1 },
    },
  ])

  return agg[0] || { count: 0, revenue: 0 }
}

export const getGroupedByBranch = async ({ start, end, branchId }) => {
  if (!branchId) return []
  return await Booking.aggregate([
    {
      $match: {
        branchId,
        status: { $in: VALID_STATUSES },
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$branchId",
        count: { $sum: 1 },
        revenue: { $sum: { $ifNull: ["$price", 0] } },
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

// Prepared structure (not used in UI yet)
export const getGroupedByService = async ({ start, end, branchId }) => {
  if (!branchId) return []
  return await Booking.aggregate([
    {
      $match: {
        branchId,
        status: { $in: VALID_STATUSES },
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$serviceId",
        serviceName: { $first: "$serviceName" },
        count: { $sum: 1 },
        revenue: { $sum: { $ifNull: ["$price", 0] } },
      },
    },
    { $project: { _id: 0, serviceId: "$_id", serviceName: 1, count: 1, revenue: 1 } },
    { $sort: { revenue: -1, count: -1, serviceName: 1 } },
  ])
}

