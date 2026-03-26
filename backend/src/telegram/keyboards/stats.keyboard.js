// backend/src/telegram/keyboards/stats.keyboard.js

import { Markup } from "telegraf"

export const STATS_CB = {
  MENU: "crm_stats:menu",
  PERIOD: "crm_stats:period", // crm_stats:period:today|month|year
  DAY: "crm_stats:day", // crm_stats:day:YYYY-MM-DD
  MONTH: "crm_stats:month", // crm_stats:month:YYYY-MM
}

export const statsMenuKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📅 Сегодня", `${STATS_CB.PERIOD}:today`)],
    [Markup.button.callback("🗓 Текущий месяц", `${STATS_CB.PERIOD}:month`)],
    [Markup.button.callback("📆 Текущий год", `${STATS_CB.PERIOD}:year`)],
    [Markup.button.callback("⬅️ Назад", "crm_back:admin")],
  ])
}

export const statsPeriodKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📅 Сегодня", `${STATS_CB.PERIOD}:today`)],
    [Markup.button.callback("🗓 Текущий месяц", `${STATS_CB.PERIOD}:month`)],
    [Markup.button.callback("📆 Текущий год", `${STATS_CB.PERIOD}:year`)],
    [Markup.button.callback("⬅️ Назад", "crm_back:stats_menu")],
  ])
}

export const statsMonthDaysKeyboard = ({ days }) => {
  const rows = []
  const perRow = 7
  for (let i = 0; i < days.length; i += perRow) {
    const chunk = days.slice(i, i + perRow)
    rows.push(
      chunk.map((d) =>
        Markup.button.callback(d.slice(8, 10), `${STATS_CB.DAY}:${d}`)
      )
    )
  }
  rows.push([Markup.button.callback("⬅️ Назад", "crm_back:stats_menu")])
  return Markup.inlineKeyboard(rows)
}

const RU_MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь"
]

export const statsYearMonthsKeyboard = ({ months }) => {
  const rows = months.map((ym) => {
    const monthIndex = Number(ym.slice(5, 7)) - 1
    const label = RU_MONTHS[monthIndex] || ym
    return [Markup.button.callback(label, `${STATS_CB.MONTH}:${ym}`)]
  })

  rows.push([Markup.button.callback("⬅️ Назад", "crm_back:stats_menu")])
  return Markup.inlineKeyboard(rows)
}

