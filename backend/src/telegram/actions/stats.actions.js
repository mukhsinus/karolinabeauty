// backend/src/telegram/actions/stats.actions.js

import { tSafe } from "../../utils/translate.js"

import {
  getStatsRange,
  getTotals,
  getGroupedByBranch,
  getGroupedByService
} from "../queries/stats.queries.js"

export const loadStats = async ({ period, group }) => {
  const { start, end } = getStatsRange(period)

  const totals = await getTotals({ start, end })

  if (group === "branch") {
    const rows = await getGroupedByBranch({ start, end })
    return { start, end, totals, group, rows }
  }

  if (group === "service") {
    const rows = await getGroupedByService({ start, end })
    return { start, end, totals, group, rows }
  }

  return { start, end, totals, group: null, rows: [] }
}

export const formatStatsMessage = ({ period, start, end, totals, group, rows }) => {
  const header =
    period === "next7"
      ? `📊 Статистика (следующие 7 дней)\n📅 ${start} — ${end}`
      : `📊 Статистика (сегодня)\n📅 ${start}`

  const totalLine = `\n\nВсего записей: ${totals.count}\nВыручка: ${totals.revenue}`

  if (!group) return header + totalLine

  if (!rows?.length) return header + totalLine + "\n\n(нет данных)"

  const body =
    group === "branch"
      ? rows
          .map((r) => `- 🏢 ${r.branchName}: ${r.count} • ${r.revenue}`)
          .join("\n")
      : rows
          .slice(0, 30)
          .map((r) => `- 💅 ${tSafe(r.serviceName)} (${r.serviceLevel}): ${r.count} • ${r.revenue}`)
          .join("\n")

  return header + totalLine + `\n\n${body}`
}

