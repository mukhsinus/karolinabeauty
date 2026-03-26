// backend/src/telegram/flows/stats.flow.js

import {
  statsMenuKeyboard,
  statsPeriodKeyboard,
  statsMonthDaysKeyboard,
  statsYearMonthsKeyboard
} from "../keyboards/stats.keyboard.js"
import {
  loadStats,
  formatStatsMessage,
  loadStatsMonthDays,
  loadStatsYearMonths
} from "../actions/stats.actions.js"
import { pushNav, resetNav } from "../core/nav.js"
import { setPayload, setStep } from "../core/session.js"
import { STEPS } from "../core/constants.js"

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
    setPayload(ctx, { flow: "stats" })
    setStep(ctx, STEPS.CRM_STATS_MENU)
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
    if (!["today", "month", "year"].includes(period)) return safeErrorReply(ctx)
    setPayload(ctx, { flow: "stats" })
    setStep(ctx, STEPS.CRM_STATS_PERIOD)
    const branchId = ctx.session?.branchId || null
    if (!branchId) {
      return ctx.reply("⚠️ Сначала выберите филиал при входе (/start).")
    }

    if (period === "month") {
      const { days, year, month } = await loadStatsMonthDays()
      pushNav(ctx, { flow: "stats", step: "period", params: { period } })
      return ctx.editMessageText(
        `Выберите день (${String(month).padStart(2, "0")}.${year}):`,
        statsMonthDaysKeyboard({ days })
      )
    }

    if (period === "year") {
      const { months, year } = await loadStatsYearMonths()
      pushNav(ctx, { flow: "stats", step: "period", params: { period } })
      return ctx.editMessageText(
        `Выберите месяц (${year}):`,
        statsYearMonthsKeyboard({ months })
      )
    }

    const data = await loadStats({ mode: "today", branchId })
    const text = formatStatsMessage({ mode: "today", ...data })

    pushNav(ctx, { flow: "stats", step: "period", params: { period } })
    await ctx.editMessageText(text, statsPeriodKeyboard())
  } catch (error) {
    console.error("[CRM] selectStatsPeriod error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectStatsDay = async (ctx, { date }) => {
  try {
    const branchId = ctx.session?.branchId || null
    if (!branchId) return ctx.reply("⚠️ Сначала выберите филиал при входе (/start).")
    const data = await loadStats({ mode: "day", branchId, date })
    const text = formatStatsMessage({ mode: "day", ...data })
    return ctx.editMessageText(text, statsPeriodKeyboard())
  } catch (error) {
    console.error("[CRM] selectStatsDay error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectStatsMonth = async (ctx, { yearMonth }) => {
  try {
    const branchId = ctx.session?.branchId || null
    if (!branchId) return ctx.reply("⚠️ Сначала выберите филиал при входе (/start).")
    const [year, month] = yearMonth.split("-").map(Number)
    const data = await loadStats({ mode: "month_selected", branchId, yearMonth })
    const text = formatStatsMessage({ mode: "month_selected", year, month, ...data })
    return ctx.editMessageText(text, statsPeriodKeyboard())
  } catch (error) {
    console.error("[CRM] selectStatsMonth error:", error)
    return safeErrorReply(ctx)
  }
}

// showStats removed (only by-branch stats are supported)

