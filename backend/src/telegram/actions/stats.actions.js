// backend/src/telegram/actions/stats.actions.js

import {
  getStatsToday,
  getStatsCurrentMonth,
  getStatsCurrentYear,
  getStatsForDay,
  getStatsForMonth,
  getCurrentMonthDayButtons,
  getCurrentYearMonthButtons
} from "../../services/statistics.service.js"

import { formatDate } from "../utils/date.js"

const RU_MONTHS_GEN = [
  "январь",
  "февраль",
  "март",
  "апрель",
  "май",
  "июнь",
  "июль",
  "август",
  "сентябрь",
  "октябрь",
  "ноябрь",
  "декабрь"
]

export const loadStats = async ({ mode, branchId, date, yearMonth }) => {
  if (mode === "today") return getStatsToday({ branchId })
  if (mode === "month") return getStatsCurrentMonth({ branchId })
  if (mode === "year") return getStatsCurrentYear({ branchId })
  if (mode === "day" && date) return getStatsForDay({ branchId, date })
  if (mode === "month_selected" && yearMonth) {
    const [y, m] = yearMonth.split("-").map(Number)
    return getStatsForMonth({ branchId, year: y, month: m })
  }
  return getStatsToday({ branchId })
}

export const loadStatsMonthDays = async () => {
  return getCurrentMonthDayButtons()
}

export const loadStatsYearMonths = async () => {
  return getCurrentYearMonthButtons()
}

export const formatStatsMessage = ({ mode, start, end, totals, rows, year, month }) => {
  let header = `📊 Статистика\n📅 ${formatDate(start)}`
  if (mode === "today") header = `📊 Статистика (сегодня)\n📅 ${formatDate(start)}`
  if (mode === "day") header = `📊 Статистика (день)\n📅 ${formatDate(start)}`
  if (mode === "month") header = `📊 Статистика (${RU_MONTHS_GEN[(month || 1) - 1]} ${year})`
  if (mode === "month_selected") header = `📊 Статистика (${RU_MONTHS_GEN[(month || 1) - 1]} ${year})`
  if (mode === "year") header = `📊 Статистика (${year})`

  const totalLine = `\n\nВсего записей: ${totals.count}\nВыручка: ${totals.revenue}`

  if (!rows?.length) return header + totalLine + "\n\n(нет данных)"

  const body = rows
    .map((r) => `- 🏢 ${r.branchName}: ${r.count} • ${r.revenue}`)
    .join("\n")

  return header + totalLine + `\n\n${body}`
}

