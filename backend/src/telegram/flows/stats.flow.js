// backend/src/telegram/flows/stats.flow.js

import { statsMenuKeyboard, statsGroupKeyboard } from "../keyboards/stats.keyboard.js"
import { loadStats, formatStatsMessage } from "../actions/stats.actions.js"

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
    return ctx.reply("Статистика:", statsMenuKeyboard())
  } catch (error) {
    console.error("[CRM] startStatsFlow error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectStatsPeriod = async (ctx, { period }) => {
  try {
    if (!["today", "next7"].includes(period)) return safeErrorReply(ctx)
    await ctx.editMessageText("Выберите группировку:", statsGroupKeyboard({ period }))
  } catch (error) {
    console.error("[CRM] selectStatsPeriod error:", error)
    return safeErrorReply(ctx)
  }
}

export const showStats = async (ctx, { group, period }) => {
  try {
    if (!["today", "next7"].includes(period)) return safeErrorReply(ctx)
    if (!["branch", "service"].includes(group)) return safeErrorReply(ctx)

    const data = await loadStats({ period, group })
    const text = formatStatsMessage({ period, ...data })

    await ctx.editMessageText(text, statsGroupKeyboard({ period }))
  } catch (error) {
    console.error("[CRM] showStats error:", error)
    return safeErrorReply(ctx)
  }
}

