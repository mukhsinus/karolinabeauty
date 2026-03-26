// backend/src/telegram/keyboards/stats.keyboard.js

import { Markup } from "telegraf"

export const STATS_CB = {
  MENU: "crm_stats:menu",
  PERIOD: "crm_stats:period", // crm_stats:period:today|next7
}

export const statsMenuKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📅 Сегодня", `${STATS_CB.PERIOD}:today`)],
    [Markup.button.callback("🗓 Следующие 7 дней", `${STATS_CB.PERIOD}:next7`)],
  ])
}

export const statsPeriodKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📅 Сегодня", `${STATS_CB.PERIOD}:today`)],
    [Markup.button.callback("🗓 Следующие 7 дней", `${STATS_CB.PERIOD}:next7`)],
  ])
}

