// backend/src/telegram/actions/stats.actions.js

import {
  getStatsRange,
  getTotals,
  getGroupedByBranch,
} from "../queries/stats.queries.js"

export const loadStats = async ({ period }) => {
  const { start, end } = getStatsRange(period)

  const totals = await getTotals({ start, end })
  const rows = await getGroupedByBranch({ start, end })

  return { start, end, totals, rows }
}

export const formatStatsMessage = ({ period, start, end, totals, rows }) => {
  const header =
    period === "next7"
      ? `📊 Статистика (следующие 7 дней)\n📅 ${start} — ${end}`
      : `📊 Статистика (сегодня)\n📅 ${start}`

  const totalLine = `\n\nВсего записей: ${totals.count}\nВыручка: ${totals.revenue}`

  if (!rows?.length) return header + totalLine + "\n\n(нет данных)"

  const body = rows
    .map((r) => `- 🏢 ${r.branchName}: ${r.count} • ${r.revenue}`)
    .join("\n")

  return header + totalLine + `\n\n${body}`
}

