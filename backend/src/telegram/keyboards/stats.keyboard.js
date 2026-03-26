// backend/src/telegram/keyboards/stats.keyboard.js

import { Markup } from "telegraf"

export const STATS_CB = {
  MENU: "crm_stats:menu",
  PERIOD: "crm_stats:period", // crm_stats:period:today|next7
  GROUP: "crm_stats:group", // crm_stats:group:branch|service
}

export const statsMenuKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📅 Сегодня", `${STATS_CB.PERIOD}:today`)],
    [Markup.button.callback("🗓 Следующие 7 дней", `${STATS_CB.PERIOD}:next7`)],
  ])
}

export const statsGroupKeyboard = ({ period }) => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("🏢 По филиалам", `${STATS_CB.GROUP}:branch:${period}`),
      Markup.button.callback("💅 По услугам", `${STATS_CB.GROUP}:service:${period}`),
    ],
    [Markup.button.callback("⬅️ Назад", STATS_CB.MENU)],
  ])
}

