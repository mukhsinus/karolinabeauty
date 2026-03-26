// backend/src/telegram/flows/blocking.flow.js

import { setPayload } from "../core/session.js"
import { getBranches } from "../services/api.service.js"

import {
  getBlockedInfoForDate,
  blockDay,
  blockTime,
  unblockDay,
  unblockTime
} from "../../services/blockedSlot.service.js"

import {
  branchesKeyboard,
  datesKeyboard,
  blockingActionsKeyboard,
  timesKeyboard
} from "../keyboards/blocking.keyboard.js"
import { pushNav, resetNav } from "../core/nav.js"

const safeErrorReply = async (ctx) => {
  try {
    await ctx.answerCbQuery("Ошибка")
  } catch {}

  try {
    await ctx.reply("⚠️ Ошибка. Попробуйте снова")
  } catch {}
}

const isValidObjectId = (id) =>
  typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id)

const isDateISO = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s)
const isTimeHHMM = (s) => typeof s === "string" && /^\d{2}:\d{2}$/.test(s)

const toISODate = (d) => d.toISOString().slice(0, 10)

const getNextDays = (count) => {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < count; i++) {
    const x = new Date(today)
    x.setDate(today.getDate() + i)
    days.push(toISODate(x))
  }

  return days
}

const generateTimeSlots = (date) => {
  const d = new Date(date)
  const isWeekend = d.getDay() === 0 || d.getDay() === 6
  const start = isWeekend ? 10 : 9
  const end = isWeekend ? 22 : 21

  const slots = []
  for (let h = start; h < end; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`)
    slots.push(`${String(h).padStart(2, "0")}:30`)
  }

  return slots
}

const renderActions = async (ctx) => {
  const branchId = ctx.session?.payload?.blocking?.branchId
  const date = ctx.session?.payload?.blocking?.date

  if (!isValidObjectId(branchId) || !isDateISO(date)) {
    return safeErrorReply(ctx)
  }

  const info = await getBlockedInfoForDate({ branchId, date })
  const text = `Блокировки\n\n🏢 Филиал: ${branchId}\n📅 Дата: ${date}\n\n` +
    (info.isDayBlocked
      ? "⛔ День заблокирован"
      : info.times.length
        ? `⛔ Заблокировано времени: ${info.times.join(", ")}`
        : "✅ Нет блокировок")

  await ctx.editMessageText(
    text,
    blockingActionsKeyboard({
      isDayBlocked: info.isDayBlocked,
      blockedTimes: info.times
    })
  )
}

export const startBlockingFlow = async (ctx) => {
  try {
    resetNav(ctx)
    setPayload(ctx, {
      blocking: {
        branchId: null,
        date: null
      }
    })

    const branches = await getBranches()
    if (!branches?.length) return ctx.reply("⚠️ Нет доступных филиалов")

    pushNav(ctx, { flow: "blocking", step: "branch" })
    try {
      await ctx.editMessageText("Выберите филиал для блокировки:", branchesKeyboard(branches))
    } catch {
      await ctx.reply("Выберите филиал для блокировки:", branchesKeyboard(branches))
    }
    return
  } catch (error) {
    console.error("[CRM] startBlockingFlow error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectBlockingBranch = async (ctx, { branchId }) => {
  try {
    if (!isValidObjectId(branchId)) return safeErrorReply(ctx)

    setPayload(ctx, {
      blocking: {
        branchId,
        date: null
      }
    })

    const dates = getNextDays(14)
    pushNav(ctx, { flow: "blocking", step: "date", params: { branchId } })
    await ctx.editMessageText("Выберите дату:", datesKeyboard(dates))
  } catch (error) {
    console.error("[CRM] selectBlockingBranch error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectBlockingDate = async (ctx, { date }) => {
  try {
    if (!isDateISO(date)) return safeErrorReply(ctx)

    const branchId = ctx.session?.payload?.blocking?.branchId
    if (!isValidObjectId(branchId)) return safeErrorReply(ctx)

    setPayload(ctx, {
      blocking: {
        ...ctx.session.payload.blocking,
        date
      }
    })

    pushNav(ctx, { flow: "blocking", step: "actions", params: { date } })
    return renderActions(ctx)
  } catch (error) {
    console.error("[CRM] selectBlockingDate error:", error)
    return safeErrorReply(ctx)
  }
}

export const doBlockDay = async (ctx) => {
  try {
    const branchId = ctx.session?.payload?.blocking?.branchId
    const date = ctx.session?.payload?.blocking?.date
    if (!isValidObjectId(branchId) || !isDateISO(date)) return safeErrorReply(ctx)

    await blockDay({ branchId, date })

    try {
      await ctx.answerCbQuery("День заблокирован")
    } catch {}

    return renderActions(ctx)
  } catch (error) {
    console.error("[CRM] doBlockDay error:", error)
    return safeErrorReply(ctx)
  }
}

export const startBlockTimePick = async (ctx) => {
  try {
    const branchId = ctx.session?.payload?.blocking?.branchId
    const date = ctx.session?.payload?.blocking?.date
    if (!isValidObjectId(branchId) || !isDateISO(date)) return safeErrorReply(ctx)

    const slots = generateTimeSlots(date)
    pushNav(ctx, { flow: "blocking", step: "times" })
    await ctx.editMessageText(`Выберите время для блокировки (${date}):`, timesKeyboard(slots))
  } catch (error) {
    console.error("[CRM] startBlockTimePick error:", error)
    return safeErrorReply(ctx)
  }
}

export const doBlockTime = async (ctx, { time }) => {
  try {
    if (!isTimeHHMM(time)) return safeErrorReply(ctx)

    const branchId = ctx.session?.payload?.blocking?.branchId
    const date = ctx.session?.payload?.blocking?.date
    if (!isValidObjectId(branchId) || !isDateISO(date)) return safeErrorReply(ctx)

    await blockTime({ branchId, date, time })

    try {
      await ctx.answerCbQuery("Время заблокировано")
    } catch {}

    return renderActions(ctx)
  } catch (error) {
    console.error("[CRM] doBlockTime error:", error)
    return safeErrorReply(ctx)
  }
}

export const doUnblockDay = async (ctx) => {
  try {
    const branchId = ctx.session?.payload?.blocking?.branchId
    const date = ctx.session?.payload?.blocking?.date
    if (!isValidObjectId(branchId) || !isDateISO(date)) return safeErrorReply(ctx)

    await unblockDay({ branchId, date })

    try {
      await ctx.answerCbQuery("День разблокирован")
    } catch {}

    return renderActions(ctx)
  } catch (error) {
    console.error("[CRM] doUnblockDay error:", error)
    return safeErrorReply(ctx)
  }
}

export const doUnblockTime = async (ctx, { time }) => {
  try {
    if (!isTimeHHMM(time)) return safeErrorReply(ctx)

    const branchId = ctx.session?.payload?.blocking?.branchId
    const date = ctx.session?.payload?.blocking?.date
    if (!isValidObjectId(branchId) || !isDateISO(date)) return safeErrorReply(ctx)

    await unblockTime({ branchId, date, time })

    try {
      await ctx.answerCbQuery("Разблокировано")
    } catch {}

    return renderActions(ctx)
  } catch (error) {
    console.error("[CRM] doUnblockTime error:", error)
    return safeErrorReply(ctx)
  }
}

export const backBlocking = async (ctx, { step }) => {
  try {
    if (step === "branch") {
      return startBlockingFlow(ctx)
    }

    if (step === "date") {
      const dates = getNextDays(14)
      await ctx.editMessageText("Выберите дату:", datesKeyboard(dates))
      return
    }

    // step === "actions"
    return renderActions(ctx)
  } catch (error) {
    console.error("[CRM] backBlocking error:", error)
    return safeErrorReply(ctx)
  }
}

