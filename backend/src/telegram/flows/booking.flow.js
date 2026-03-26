// backend/src/telegram/flows/booking.flow.js

import {
  bookingMenuKeyboard,
  bookingListKeyboard,
  bookingCardKeyboard,
  bookingConfirmKeyboard,
  rescheduleDatesKeyboard,
  rescheduleTimesKeyboard,
  rescheduleConfirmKeyboard
} from "../keyboards/booking.keyboard.js"

import {
  listBookings,
  listBranches,
  getBookingCardData,
  cancelBooking,
  completeBooking,
  getUnavailableSlots,
  rescheduleBooking
} from "../actions/booking.actions.js"

import { setPayload } from "../core/session.js"
import { Markup } from "telegraf"

const safeErrorReply = async (ctx) => {
  try {
    await ctx.answerCbQuery("Ошибка")
  } catch {}

  try {
    await ctx.reply("⚠️ Ошибка. Попробуйте снова")
  } catch {}
}

const isValidObjectId = (id) => typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id)

const toISODate = (d) => d.toISOString().slice(0, 10)

const isDateISO = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s)
const isTimeHHMM = (s) => typeof s === "string" && /^\d{2}:\d{2}$/.test(s)

const SERVICE_LEVELS = [
  { id: "master", label: "Мастер" },
  { id: "top", label: "Топ" },
  { id: "premium", label: "Премиум" }
]

const filtersBranchKeyboard = (branches) => {
  const rows = branches.map((b) => [
    Markup.button.callback(`🏢 ${b.name}`, `crm_booking:filter_branch:${b._id}`)
  ])

  rows.push([Markup.button.callback("🏠 Меню", "crm_booking:menu")])
  return Markup.inlineKeyboard(rows)
}

const filtersLevelKeyboard = () => {
  const rows = SERVICE_LEVELS.map((l) => [
    Markup.button.callback(l.label, `crm_booking:filter_level:${l.id}`)
  ])

  rows.push([Markup.button.callback("🏠 Меню", "crm_booking:menu")])
  return Markup.inlineKeyboard(rows)
}

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

const showRescheduleDates = async (ctx) => {
  const dates = getNextDays(14)
  await ctx.editMessageText("Выберите дату переноса:", rescheduleDatesKeyboard({ dates }))
}

const showRescheduleTimesForDate = async (ctx, { bookingId, date }) => {
  if (!isValidObjectId(bookingId) || !isDateISO(date)) throw new Error("Invalid reschedule payload")

  const booking = await getBookingCardData(bookingId)
  if (!booking || booking.status !== "confirmed") {
    try {
      await ctx.answerCbQuery("Запись уже не активна")
    } catch {}
    return showRescheduleDates(ctx)
  }

  const branchId = booking?.branchId?._id || booking?.branchId
  const serviceId = booking?.serviceId
  const serviceLevel = booking?.serviceLevel

  const unavailable = await getUnavailableSlots({
    branchId,
    serviceId,
    serviceLevel,
    date
  })

  const allSlots = generateTimeSlots(date)
  const unavailableSet = new Set(Array.isArray(unavailable) ? unavailable : [])
  const availableSlots = allSlots.filter((t) => !unavailableSet.has(t))

  if (availableSlots.length === 0) {
    const dates = getNextDays(14)
    await ctx.editMessageText(
      `❌ Нет свободных слотов на ${date}`,
      rescheduleDatesKeyboard({ dates })
    )
    return
  }

  await ctx.editMessageText(
    `Выберите время на ${date}:`,
    rescheduleTimesKeyboard({ times: availableSlots })
  )
}

const formatBookingCard = (b) => {
  const branchName = b?.branchId?.name || "-"
  const service = `${b.serviceName || "-"} (${b.serviceLevel || "-"})`

  return `🕒 ${b.time}
👤 ${b.name}
📞 ${b.phone}
💇 ${service}
💰 ${b.price}
🏢 ${branchName}

📅 ${b.date}
🆔 ${b._id}
`
}

export const startBookingManagement = async (ctx) => {
  try {
    // reset booking scope + start filter selection
    setPayload(ctx, {
      booking: {
        ...ctx.session.payload.booking,
        type: "today",
        page: 0,
        limit: ctx.session?.payload?.booking?.limit || 5,
        selectedBookingId: null,
        branchId: null,
        serviceLevel: null
      }
    })

    const branches = await listBranches()
    if (!branches || branches.length === 0) {
      return ctx.reply("⚠️ Нет доступных филиалов")
    }

    return ctx.reply("Выберите филиал:", filtersBranchKeyboard(branches))
  } catch (error) {
    console.error("[CRM] startBookingManagement error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectBookingBranchFilter = async (ctx, { branchId }) => {
  try {
    if (!isValidObjectId(branchId)) return safeErrorReply(ctx)

    setPayload(ctx, {
      booking: {
        ...ctx.session.payload.booking,
        branchId,
        serviceLevel: null
      }
    })

    try {
      await ctx.editMessageText("Выберите уровень мастера:", filtersLevelKeyboard())
    } catch {
      await ctx.reply("Выберите уровень мастера:", filtersLevelKeyboard())
    }
  } catch (error) {
    console.error("[CRM] selectBookingBranchFilter error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectBookingLevelFilter = async (ctx, { serviceLevel }) => {
  try {
    if (!SERVICE_LEVELS.some((l) => l.id === serviceLevel)) return safeErrorReply(ctx)

    setPayload(ctx, {
      booking: {
        ...ctx.session.payload.booking,
        serviceLevel
      }
    })

    try {
      await ctx.editMessageText("Управление записями:", bookingMenuKeyboard())
    } catch {
      await ctx.reply("Управление записями:", bookingMenuKeyboard())
    }
  } catch (error) {
    console.error("[CRM] selectBookingLevelFilter error:", error)
    return safeErrorReply(ctx)
  }
}

export const showBookingList = async (ctx, { type, page }) => {
  try {
    const limit = ctx.session?.payload?.booking?.limit || 5
    const safePage = Math.max(0, Number(page) || 0)

    const branchId = ctx.session?.payload?.booking?.branchId || null
    const serviceLevel = ctx.session?.payload?.booking?.serviceLevel || null

    const result = await listBookings({
      type,
      page: safePage,
      limit,
      branchId,
      serviceLevel
    })

    setPayload(ctx, {
      booking: {
        ...ctx.session.payload.booking,
        type,
        page: result.page,
        limit: result.limit,
        selectedBookingId: null,
      },
    })

    const header =
      type === "next7"
        ? "Записи на ближайшие 7 дней:"
        : "Записи на сегодня:"

    const text =
      result.items.length === 0
        ? `${header}\n\n(пусто)`
        : header

    // Prefer editing message when coming from callback; fallback to reply.
    try {
      await ctx.editMessageText(
        text,
        bookingListKeyboard({
          type,
          page: result.page,
          hasPrev: result.hasPrev,
          hasNext: result.hasNext,
          items: result.items,
        })
      )
    } catch {
      await ctx.reply(
        text,
        bookingListKeyboard({
          type,
          page: result.page,
          hasPrev: result.hasPrev,
          hasNext: result.hasNext,
          items: result.items,
        })
      )
    }
  } catch (error) {
    console.error("[CRM] showBookingList error:", error)
    return safeErrorReply(ctx)
  }
}

export const openBookingCard = async (ctx, { bookingId, type, page }) => {
  try {
    if (!isValidObjectId(bookingId)) {
      try {
        await ctx.answerCbQuery("Запись не найдена")
      } catch {}
      return safeErrorReply(ctx)
    }

    const booking = await getBookingCardData(bookingId)

    setPayload(ctx, {
      booking: {
        ...ctx.session.payload.booking,
        type,
        page: Math.max(0, Number(page) || 0),
        selectedBookingId: bookingId,
      },
    })

    if (!booking || booking.status !== "confirmed") {
      try {
        await ctx.answerCbQuery("Запись уже не активна")
      } catch {}
      return showBookingList(ctx, { type, page: Math.max(0, Number(page) || 0) })
    }

    const text = formatBookingCard(booking)

    try {
      await ctx.editMessageText(
        text,
        bookingCardKeyboard({ bookingId, type, page: Math.max(0, Number(page) || 0) })
      )
    } catch {
      await ctx.reply(
        text,
        bookingCardKeyboard({ bookingId, type, page: Math.max(0, Number(page) || 0) })
      )
    }
  } catch (error) {
    console.error("[CRM] openBookingCard error:", error)
    return safeErrorReply(ctx)
  }
}

export const confirmCancelBooking = async (ctx, { bookingId, type, page }) => {
  try {
    if (!isValidObjectId(bookingId)) return safeErrorReply(ctx)

    const booking = await getBookingCardData(bookingId)
    if (!booking || booking.status !== "confirmed") {
      try {
        await ctx.answerCbQuery("Запись уже не активна")
      } catch {}
      return showBookingList(ctx, { type, page: Math.max(0, Number(page) || 0) })
    }

    setPayload(ctx, {
      booking: {
        ...ctx.session.payload.booking,
        selectedBookingId: bookingId,
      },
    })

    await ctx.editMessageText(
      "Подтвердить отмену записи?",
      bookingConfirmKeyboard({ kind: "cancel", bookingId, type, page: Math.max(0, Number(page) || 0) })
    )
  } catch (error) {
    console.error("[CRM] confirmCancelBooking error:", error)
    return safeErrorReply(ctx)
  }
}

export const confirmCompleteBooking = async (ctx, { bookingId, type, page }) => {
  try {
    if (!isValidObjectId(bookingId)) return safeErrorReply(ctx)

    const booking = await getBookingCardData(bookingId)
    if (!booking || booking.status !== "confirmed") {
      try {
        await ctx.answerCbQuery("Запись уже не активна")
      } catch {}
      return showBookingList(ctx, { type, page: Math.max(0, Number(page) || 0) })
    }

    setPayload(ctx, {
      booking: {
        ...ctx.session.payload.booking,
        selectedBookingId: bookingId,
      },
    })

    await ctx.editMessageText(
      "Подтвердить завершение записи?",
      bookingConfirmKeyboard({ kind: "complete", bookingId, type, page: Math.max(0, Number(page) || 0) })
    )
  } catch (error) {
    console.error("[CRM] confirmCompleteBooking error:", error)
    return safeErrorReply(ctx)
  }
}

export const doCancelBooking = async (ctx, { bookingId, type, page }) => {
  try {
    if (!isValidObjectId(bookingId)) return safeErrorReply(ctx)

    await cancelBooking(bookingId)

    try {
      await ctx.answerCbQuery("Отменено")
    } catch {}

    // reset to page 0 for stability after list shrink
    return showBookingList(ctx, { type, page: 0 })
  } catch (error) {
    console.error("[CRM] doCancelBooking error:", error)
    return safeErrorReply(ctx)
  }
}

export const doCompleteBooking = async (ctx, { bookingId, type, page }) => {
  try {
    if (!isValidObjectId(bookingId)) return safeErrorReply(ctx)

    await completeBooking(bookingId)

    try {
      await ctx.answerCbQuery("Завершено")
    } catch {}

    // reset to page 0 for stability after list shrink
    return showBookingList(ctx, { type, page: 0 })
  } catch (error) {
    console.error("[CRM] doCompleteBooking error:", error)
    return safeErrorReply(ctx)
  }
}

export const showBookingMenu = async (ctx) => {
  try {
    try {
      await ctx.editMessageText("Управление записями:", bookingMenuKeyboard())
    } catch {
      await ctx.reply("Управление записями:", bookingMenuKeyboard())
    }
  } catch (error) {
    console.error("[CRM] showBookingMenu error:", error)
    return safeErrorReply(ctx)
  }
}

// ================= RESCHEDULING =================

export const startRescheduleBooking = async (ctx, { bookingId, type, page }) => {
  try {
    if (!isValidObjectId(bookingId)) {
      try {
        await ctx.answerCbQuery("Запись не найдена")
      } catch {}
      return safeErrorReply(ctx)
    }

    const booking = await getBookingCardData(bookingId)
    if (!booking || booking.status !== "confirmed") {
      try {
        await ctx.answerCbQuery("Запись уже не активна")
      } catch {}
      return showBookingList(ctx, { type, page: Math.max(0, Number(page) || 0) })
    }

    setPayload(ctx, {
      booking: {
        ...ctx.session.payload.booking,
        selectedBookingId: bookingId,
        type,
        page: Math.max(0, Number(page) || 0),
        reschedule: {
          bookingId,
          type,
          page: Math.max(0, Number(page) || 0),
          date: null,
          time: null
        }
      }
    })

    const dates = getNextDays(14)
    const text = `Выберите дату переноса:\n\n🆔 ${bookingId}`

    await ctx.editMessageText(text, rescheduleDatesKeyboard({ dates }))
  } catch (error) {
    console.error("[CRM] startRescheduleBooking error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectRescheduleDate = async (ctx, { date }) => {
  try {
    const rs = ctx.session?.payload?.booking?.reschedule
    const bookingId = rs?.bookingId

    if (!isValidObjectId(bookingId)) return safeErrorReply(ctx)
    if (!isDateISO(date)) return safeErrorReply(ctx)

    setPayload(ctx, {
      booking: {
        ...ctx.session.payload.booking,
        reschedule: {
          ...rs,
          date,
          time: null
        }
      }
    })

    return showRescheduleTimesForDate(ctx, { bookingId, date })
  } catch (error) {
    console.error("[CRM] selectRescheduleDate error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectRescheduleTime = async (ctx, { time }) => {
  try {
    const rs = ctx.session?.payload?.booking?.reschedule
    const bookingId = rs?.bookingId
    const date = rs?.date

    if (!isValidObjectId(bookingId)) return safeErrorReply(ctx)
    if (!isDateISO(date)) return safeErrorReply(ctx)
    if (!isTimeHHMM(time)) return safeErrorReply(ctx)

    setPayload(ctx, {
      booking: {
        ...ctx.session.payload.booking,
        reschedule: {
          ...rs,
          time
        }
      }
    })

    const booking = await getBookingCardData(bookingId)
    if (!booking || booking.status !== "confirmed") {
      try {
        await ctx.answerCbQuery("Запись уже не активна")
      } catch {}
      return showRescheduleDates(ctx)
    }

    await ctx.editMessageText(
      `Текущая запись:\n📅 ${booking.date}\n🕒 ${booking.time}\n\nНовая:\n📅 ${date}\n🕒 ${time}\n\nПеренести?`,
      rescheduleConfirmKeyboard()
    )
  } catch (error) {
    console.error("[CRM] selectRescheduleTime error:", error)
    return safeErrorReply(ctx)
  }
}

export const backReschedule = async (ctx, { step }) => {
  try {
    const rs = ctx.session?.payload?.booking?.reschedule
    const bookingId = rs?.bookingId
    const type = rs?.type || "today"
    const page = Math.max(0, Number(rs?.page) || 0)

    if (step === "card") {
      if (!isValidObjectId(bookingId)) return safeErrorReply(ctx)
      return openBookingCard(ctx, { bookingId, type, page })
    }

    if (step === "dates") {
      return showRescheduleDates(ctx)
    }

    // step === "times"
    const date = rs?.date
    if (typeof date !== "string") {
      return showRescheduleDates(ctx)
    }

    return showRescheduleTimesForDate(ctx, { bookingId, date })
  } catch (error) {
    console.error("[CRM] backReschedule error:", error)
    return safeErrorReply(ctx)
  }
}

export const doRescheduleBooking = async (ctx) => {
  try {
    const rs = ctx.session?.payload?.booking?.reschedule
    const bookingId = rs?.bookingId
    const type = rs?.type || "today"
    const date = rs?.date
    const time = rs?.time

    if (!isValidObjectId(bookingId)) return safeErrorReply(ctx)
    if (typeof date !== "string" || typeof time !== "string") return safeErrorReply(ctx)

    await rescheduleBooking(bookingId, { date, time })

    try {
      await ctx.answerCbQuery("Перенесено")
    } catch {}

    // Stability: return to list page 0 after mutation
    return showBookingList(ctx, { type, page: 0 })
  } catch (error) {
    console.error("[CRM] doRescheduleBooking error:", error)

    const msg = String(error?.message || "").toLowerCase()
    const rs = ctx.session?.payload?.booking?.reschedule
    const bookingId = rs?.bookingId
    const date = rs?.date

    if ((msg.includes("full") || msg.includes("blocked")) && isValidObjectId(bookingId) && isDateISO(date)) {
      try {
        await ctx.answerCbQuery("Слот занят")
      } catch {}

      try {
        await ctx.editMessageText("⚠️ Слот уже занят. Выберите другое время")
      } catch {
        try {
          await ctx.reply("⚠️ Слот уже занят. Выберите другое время")
        } catch {}
      }

      try {
        return await showRescheduleTimesForDate(ctx, { bookingId, date })
      } catch (e) {
        console.error("[CRM] doRescheduleBooking recovery error:", e)
        return safeErrorReply(ctx)
      }
    }

    return safeErrorReply(ctx)
  }
}

