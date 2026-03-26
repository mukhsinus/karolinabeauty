import mongoose from "mongoose"
import Booking from "../models/Booking.js"
import Branch from "../models/Branch.js"

const BUSINESS_TZ =
  process.env.BUSINESS_TIMEZONE ||
  process.env.TZ ||
  "Asia/Tashkent"

const VALID_STATUSES = ["confirmed", "completed"]

const toYMDInTZ = (d, timeZone = BUSINESS_TZ) => {
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

const addDaysYMD = (ymd, days) => {
  const [y, m, d] = ymd.split("-").map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  return toYMDInTZ(dt)
}

const getMonthRange = (year, month) => {
  const m = String(month).padStart(2, "0")
  const start = `${year}-${m}-01`
  const nextMonth = month === 12 ? new Date(year + 1, 0, 1) : new Date(year, month, 1)
  nextMonth.setDate(nextMonth.getDate() - 1)
  const end = `${year}-${m}-${String(nextMonth.getDate()).padStart(2, "0")}`
  return { start, end }
}

const toObjectId = (id) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return null
  return new mongoose.Types.ObjectId(id)
}

const aggregateStatsRange = async ({ branchId, start, end }) => {
  const bid = toObjectId(branchId)
  if (!bid) return { totals: { count: 0, revenue: 0 }, rows: [] }

  const match = {
    branchId: bid,
    status: { $in: VALID_STATUSES },
    date: { $gte: start, $lte: end }
  }

  const [totalsAgg, rowsAgg] = await Promise.all([
    Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { $sum: { $ifNull: ["$price", 0] } }
        }
      },
      { $project: { _id: 0, count: 1, revenue: 1 } }
    ]),
    Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$branchId",
          count: { $sum: 1 },
          revenue: { $sum: { $ifNull: ["$price", 0] } }
        }
      },
      {
        $lookup: {
          from: "branches",
          localField: "_id",
          foreignField: "_id",
          as: "branch"
        }
      },
      {
        $addFields: {
          branchName: { $ifNull: [{ $arrayElemAt: ["$branch.name", 0] }, "—"] }
        }
      },
      { $project: { _id: 0, branchId: "$_id", branchName: 1, count: 1, revenue: 1 } }
    ])
  ])

  return {
    totals: totalsAgg[0] || { count: 0, revenue: 0 },
    rows: rowsAgg || []
  }
}

export const getStatsToday = async ({ branchId }) => {
  const today = toYMDInTZ(new Date())
  const data = await aggregateStatsRange({ branchId, start: today, end: today })
  return { period: "today", start: today, end: today, ...data }
}

export const getStatsForDay = async ({ branchId, date }) => {
  const data = await aggregateStatsRange({ branchId, start: date, end: date })
  return { period: "day", start: date, end: date, ...data }
}

export const getStatsCurrentMonth = async ({ branchId }) => {
  const today = toYMDInTZ(new Date())
  const [year, month] = today.split("-").map(Number)
  const { start, end } = getMonthRange(year, month)
  const data = await aggregateStatsRange({ branchId, start, end })
  return { period: "month", year, month, start, end, ...data }
}

export const getStatsForMonth = async ({ branchId, year, month }) => {
  const { start, end } = getMonthRange(year, month)
  const data = await aggregateStatsRange({ branchId, start, end })
  return { period: "month", year, month, start, end, ...data }
}

export const getStatsCurrentYear = async ({ branchId }) => {
  const today = toYMDInTZ(new Date())
  const year = Number(today.slice(0, 4))
  const start = `${year}-01-01`
  const end = `${year}-12-31`
  const data = await aggregateStatsRange({ branchId, start, end })
  return { period: "year", year, start, end, ...data }
}

export const getCurrentMonthDayButtons = () => {
  const today = toYMDInTZ(new Date())
  const [year, month] = today.split("-").map(Number)
  const { start, end } = getMonthRange(year, month)
  const days = []
  let cursor = start
  while (cursor <= end) {
    days.push(cursor)
    cursor = addDaysYMD(cursor, 1)
  }
  return { year, month, days }
}

export const getCurrentYearMonthButtons = () => {
  const today = toYMDInTZ(new Date())
  const year = Number(today.slice(0, 4))
  const months = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`)
  return { year, months }
}

export const getBranchNameSafe = async (branchId) => {
  const bid = toObjectId(branchId)
  if (!bid) return "—"
  const branch = await Branch.findById(bid).select("name").lean()
  return branch?.name || "—"
}

