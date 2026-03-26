// backend/src/telegram/flows/stats.flow.js

import { statsMenuKeyboard, statsPeriodKeyboard } from "../keyboards/stats.keyboard.js"
import { loadStats, formatStatsMessage } from "../actions/stats.actions.js"
import { pushNav, resetNav } from "../core/nav.js"

const safeErrorReply = async (ctx) => {
  try {
    await ctx.answerCbQuery("Ошибка")
  } catch {}
  try {
    await ctx.reply("⚠️ Ошибка. Попробуйте снова")
  } catch {}
}

export const startStatsFlow = async (ctx) => {
  try {
    resetNav(ctx)
    pushNav(ctx, { flow: "stats", step: "menu" })

    try {
      await ctx.editMessageText("Статистика:", statsMenuKeyboard())
    } catch {
      await ctx.reply("Статистика:", statsMenuKeyboard())
    }
    return
  } catch (error) {
    console.error("[CRM] startStatsFlow error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectStatsPeriod = async (ctx, { period }) => {
  try {
    if (!["today", "next7"].includes(period)) return safeErrorReply(ctx)
    const data = await loadStats({ period })
    const text = formatStatsMessage({ period, ...data })

    pushNav(ctx, { flow: "stats", step: "period", params: { period } })
    await ctx.editMessageText(text, statsPeriodKeyboard())
  } catch (error) {
    console.error("[CRM] selectStatsPeriod error:", error)
    return safeErrorReply(ctx)
  }
}

// showStats removed (only by-branch stats are supported)

