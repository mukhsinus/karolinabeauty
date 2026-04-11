// backend/src/telegram/flows/booking.flow.js

import {
  bookingPeriodKeyboard,
  bookingNext7DaysKeyboard,
  bookingListKeyboard,
  bookingCardKeyboard,
  bookingConfirmKeyboard,
  rescheduleDatesKeyboard,
  rescheduleTimesKeyboard,
  rescheduleConfirmKeyboard
} from "../keyboards/booking.keyboard.js"

import {
  listBookings,
  getBookingCardData,
  cancelBooking,
  completeBooking,
  getUnavailableSlots,
  rescheduleBooking
} from "../actions/booking.actions.js"

import { setPayload, setStep } from "../core/session.js"
import { Markup } from "telegraf"
import { formatDate } from "../utils/date.js"
import { pushNav, resetNav } from "../core/nav.js"
import { STEPS } from "../core/constants.js"
import Branch from "../../models/Branch.js"
import { isPremiumLevelAllowedForBranch } from "../../utils/branchPremium.util.js"

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

const BUSINESS_TZ =
  process.env.BUSINESS_TIMEZONE ||
  process.env.TZ ||
  "Asia/Tashkent"

const todayYMDInTZ = () => {
  try {
    return new Intl.DateTimeFormat("sv-SE", {
      timeZone: BUSINESS_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date())
  } catch {
    return toISODate(new Date())
  }
}

const addDaysYMD = (ymd, days) => {
  const [y, m, d] = String(ymd).split("-").map(Number)
  const dt = new Date(y, (m || 1) - 1, d || 1)
  dt.setDate(dt.getDate() + days)
  return toISODate(dt)
}

const getNext7DaysRange = () => {
  const start = todayYMDInTZ()
  const dates = []
  for (let i = 0; i < 7; i++) dates.push(addDaysYMD(start, i))
  return dates
}

const showNext7DayPicker = async (ctx) => {
  const dates = getNext7DaysRange()
  pushNav(ctx, { flow: "booking", step: "day_picker" })
  await ctx.editMessageText("Выберите день:", bookingNext7DaysKeyboard({ dates }))
}

const SERVICE_LEVELS = [
  { id: "master", label: "Мастер" },
  { id: "top", label: "Топ" },
  { id: "premium", label: "Премиум" }
]

/** branch: lean { slug, name } (or null) — premium only at Yunusabad (see branchPremium.util.js) */
const filtersLevelKeyboard = (branch) => {
  const levels = SERVICE_LEVELS.filter((l) =>
    isPremiumLevelAllowedForBranch(branch, l.id)
  )
  const rows = levels.map((l) => [
    Markup.button.callback(l.label, `crm_booking:filter_level:${l.id}`)
  ])
  return Markup.inlineKeyboard(rows)
}

async function loadSessionBranchLean(ctx) {
  const bid = ctx.session?.branchId
  if (!bid || !isValidObjectId(String(bid))) return null
  return Branch.findById(bid).select("slug name").lean()
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

  const availability = await getUnavailableSlots({
    branchId,
    serviceId,
    serviceLevel,
    date
  })

  let availableSlots = []
  if (availability?.type === "manual") {
    await ctx.editMessageText(
      "Эта услуга записывается вручную. Свяжитесь с администратором.",
      rescheduleDatesKeyboard({ dates: getNextDays(14) })
    )
    return
  }
  if (availability?.type === "slots" && Array.isArray(availability.slots)) {
    availableSlots = availability.slots
      .filter((s) => s.available)
      .map((s) => s.time)
      .sort((a, b) => a.localeCompare(b))
  }

  if (availableSlots.length === 0) {
    const dates = getNextDays(14)
    await ctx.editMessageText(
      `❌ Нет свободных слотов на ${formatDate(date)}`,
      rescheduleDatesKeyboard({ dates })
    )
    return
  }

  await ctx.editMessageText(
    `Выберите время на ${formatDate(date)}:`,
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

📅 ${formatDate(b.date)}
🆔 ${b._id}
`
}

export const startBookingManagement = async (ctx) => {
  try {
    resetNav(ctx)
    setPayload(ctx, { flow: "booking" })
    setStep(ctx, STEPS.CRM_BOOKING_LEVEL)
    const sessionBranchId = ctx.session?.branchId || null
    if (!sessionBranchId) {
      return ctx.reply("⚠️ Сначала выберите филиал при входе (/start).")
    }

    const branch = await loadSessionBranchLean(ctx)

    // reset booking scope + level selection (branch is already selected in onboarding)
    setPayload(ctx, {
      booking: {
        ...ctx.session.payload.booking,
        type: "today",
        page: 0,
        limit: ctx.session?.payload?.booking?.limit || 5,
        selectedBookingId: null,
        branchId: sessionBranchId,
        serviceLevel: null
      }
    })

    pushNav(ctx, { flow: "booking", step: "level" })

    try {
      await ctx.editMessageText("Выберите уровень мастера:", filtersLevelKeyboard(branch))
    } catch {
      await ctx.reply("Выберите уровень мастера:", filtersLevelKeyboard(branch))
    }
    return
  } catch (error) {
    console.error("[CRM] startBookingManagement error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectBookingBranchFilter = async (ctx, { branchId }) => {
  try {
    // Branch selection must happen only once during onboarding.
    // Keep handler for backward-compat if old inline buttons exist.
    void branchId
    try {
      await ctx.answerCbQuery("Филиал выбирается при входе")
    } catch {}

    const branch = await loadSessionBranchLean(ctx)
    try {
      await ctx.editMessageText("Выберите уровень мастера:", filtersLevelKeyboard(branch))
    } catch {
      await ctx.reply("Выберите уровень мастера:", filtersLevelKeyboard(branch))
    }
  } catch (error) {
    console.error("[CRM] selectBookingBranchFilter error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectBookingLevelFilter = async (ctx, { serviceLevel }) => {
  try {
    if (!SERVICE_LEVELS.some((l) => l.id === serviceLevel)) return safeErrorReply(ctx)

    const branch = await loadSessionBranchLean(ctx)
    if (!isPremiumLevelAllowedForBranch(branch, serviceLevel)) {
      try {
        await ctx.answerCbQuery("Премиум недоступен в этом филиале", { show_alert: true })
      } catch {}
      setStep(ctx, STEPS.CRM_BOOKING_LEVEL)
      try {
        await ctx.editMessageText("Выберите уровень мастера:", filtersLevelKeyboard(branch))
      } catch {
        await ctx.reply("Выберите уровень мастера:", filtersLevelKeyboard(branch))
      }
      return
    }

    setPayload(ctx, { flow: "booking" })
    setStep(ctx, STEPS.CRM_BOOKING_PERIOD)

    setPayload(ctx, {
      booking: {
        ...ctx.session.payload.booking,
        serviceLevel
      }
    })

    try {
      await ctx.answerCbQuery()
    } catch {}

    pushNav(ctx, { flow: "booking", step: "period", params: { serviceLevel } })

    try {
      await ctx.editMessageText("Выберите период:", bookingPeriodKeyboard())
    } catch {
      await ctx.reply("Выберите период:", bookingPeriodKeyboard())
    }
  } catch (error) {
    console.error("[CRM] selectBookingLevelFilter error:", error)
    return safeErrorReply(ctx)
  }
}

export const showBookingList = async (ctx, { type, page }) => {
  try {
    setPayload(ctx, { flow: "booking" })
    const limit = ctx.session?.payload?.booking?.limit || 5
    const safePage = Math.max(0, Number(page) || 0)

    const branchId = ctx.session?.branchId || null
    const serviceLevel = ctx.session?.payload?.booking?.serviceLevel || null

    if (!branchId) {
      return ctx.reply("⚠️ Сначала выберите филиал при входе (/start).")
    }

    if (type === "next7") {
      // production calendar UX: next7 -> pick a day first
      setStep(ctx, STEPS.CRM_BOOKING_DAY_PICKER)
      try {
        await ctx.answerCbQuery()
      } catch {}
      try {
        return await showNext7DayPicker(ctx)
      } catch {
        // fallback to reply if message can't be edited
        const dates = getNext7DaysRange()
        pushNav(ctx, { flow: "booking", step: "day_picker" })
        await ctx.reply("Выберите день:", bookingNext7DaysKeyboard({ dates }))
        return
      }
    }

    const selectedDate = ctx.session?.payload?.booking?.selectedDate || null
    const dayDate = type === "day" ? selectedDate : null
    if (type === "day" && !isDateISO(dayDate)) {
      return showNext7DayPicker(ctx)
    }
    setStep(ctx, STEPS.CRM_BOOKING_LIST)

    const result = await listBookings({
      type,
      page: safePage,
      limit,
      branchId,
      serviceLevel,
      date: dayDate
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

    pushNav(ctx, { flow: "booking", step: "list", params: { type, page: result.page } })

    const header =
      type === "day"
        ? `Записи на ${formatDate(dayDate)}:`
        : "Записи на сегодня:"

    const text = (() => {
      if (result.items.length === 0) {
        return type === "day"
          ? `${header}\n\nНет записей на этот день`
          : `${header}\n\n(пусто)`
      }

      if (type !== "day") return header

      const blocks = result.items.map((b) => {
        const lvl =
          b.serviceLevel === "master" ? "Мастер" : b.serviceLevel === "top" ? "Топ" : "Премиум"
        return `📅 ${formatDate(b.date)}\n🕒 ${b.time}\n👤 ${b.name}\n💇 ${b.serviceName || "-"} (${lvl})\n💰 ${b.price}`
      })
      return `${header}\n\n${blocks.join("\n\n")}`
    })()

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

export const selectNext7Day = async (ctx, { date }) => {
  try {
    if (!isDateISO(date)) return safeErrorReply(ctx)
    setPayload(ctx, { flow: "booking" })
    setStep(ctx, STEPS.CRM_BOOKING_LIST)

    setPayload(ctx, {
      booking: {
        ...ctx.session.payload.booking,
        selectedDate: date
      }
    })

    pushNav(ctx, { flow: "booking", step: "day_list", params: { date, page: 0 } })

    return showBookingList(ctx, { type: "day", page: 0 })
  } catch (error) {
    console.error("[CRM] selectNext7Day error:", error)
    return safeErrorReply(ctx)
  }
}

export const openBookingCard = async (ctx, { bookingId, type, page }) => {
  try {
    setPayload(ctx, { flow: "booking" })
    setStep(ctx, STEPS.CRM_BOOKING_CARD)
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

    pushNav(ctx, {
      flow: "booking",
      step: "card",
      params: { bookingId, type, page: Math.max(0, Number(page) || 0) }
    })

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
    setPayload(ctx, { flow: "booking" })
    setStep(ctx, STEPS.CRM_BOOKING_CONFIRM)
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

    pushNav(ctx, {
      flow: "booking",
      step: "confirm_cancel",
      params: { bookingId, type, page: Math.max(0, Number(page) || 0) }
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
    setPayload(ctx, { flow: "booking" })
    setStep(ctx, STEPS.CRM_BOOKING_CONFIRM)
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

    pushNav(ctx, {
      flow: "booking",
      step: "confirm_complete",
      params: { bookingId, type, page: Math.max(0, Number(page) || 0) }
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

// showBookingMenu removed (main menu is reply keyboard)

// ================= RESCHEDULING =================

export const startRescheduleBooking = async (ctx, { bookingId, type, page }) => {
  try {
    setPayload(ctx, { flow: "booking" })
    setStep(ctx, STEPS.CRM_RESCHEDULE_DATES)
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

    pushNav(ctx, {
      flow: "booking",
      step: "reschedule_dates",
      params: { bookingId, type, page: Math.max(0, Number(page) || 0) }
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
    setPayload(ctx, { flow: "booking" })
    setStep(ctx, STEPS.CRM_RESCHEDULE_TIMES)
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

    pushNav(ctx, {
      flow: "booking",
      step: "reschedule_times",
      params: { bookingId, date }
    })

    return showRescheduleTimesForDate(ctx, { bookingId, date })
  } catch (error) {
    console.error("[CRM] selectRescheduleDate error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectRescheduleTime = async (ctx, { time }) => {
  try {
    setPayload(ctx, { flow: "booking" })
    setStep(ctx, STEPS.CRM_RESCHEDULE_CONFIRM)
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

    pushNav(ctx, {
      flow: "booking",
      step: "reschedule_confirm",
      params: { bookingId, date, time }
    })

    const booking = await getBookingCardData(bookingId)
    if (!booking || booking.status !== "confirmed") {
      try {
        await ctx.answerCbQuery("Запись уже не активна")
      } catch {}
      return showRescheduleDates(ctx)
    }

    await ctx.editMessageText(
      `Текущая запись:\n📅 ${formatDate(booking.date)}\n🕒 ${booking.time}\n\nНовая:\n📅 ${formatDate(date)}\n🕒 ${time}\n\nПеренести?`,
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

