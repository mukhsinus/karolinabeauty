import { popNav, peekNav } from "../core/nav.js"

import {
  startBookingManagement,
  selectBookingLevelFilter,
  showBookingList,
  selectNext7Day,
  openBookingCard,
  confirmCancelBooking,
  confirmCompleteBooking,
  startRescheduleBooking,
  selectRescheduleDate,
  selectRescheduleTime
} from "./booking.flow.js"

import { startStatsFlow, selectStatsPeriod } from "./stats.flow.js"

import {
  startBlockingFlow,
  selectBlockingBranch,
  selectBlockingDate,
  startBlockTimePick
} from "./blocking.flow.js"

import {
  startCapacityFlow,
  selectCapacityService,
  selectCapacityLevel,
  selectCapacityDate
} from "./capacity.flow.js"

const safeBackReply = async (ctx) => {
  try {
    await ctx.answerCbQuery("Назад")
  } catch {}
}

const route = async (ctx, entry) => {
  if (!entry) return false

  const { flow, step, params = {} } = entry

  if (flow === "booking") {
    if (step === "level") return (await startBookingManagement(ctx), true)
    if (step === "period") return (await selectBookingLevelFilter(ctx, { serviceLevel: params.serviceLevel }), true)
    if (step === "day_picker") return (await showBookingList(ctx, { type: "next7", page: 0 }), true)
    if (step === "day_list") return (await selectNext7Day(ctx, { date: params.date }), true)
    if (step === "list") return (await showBookingList(ctx, { type: params.type, page: params.page }), true)
    if (step === "card") return (await openBookingCard(ctx, { bookingId: params.bookingId, type: params.type, page: params.page }), true)
    if (step === "confirm_cancel") return (await confirmCancelBooking(ctx, { bookingId: params.bookingId, type: params.type, page: params.page }), true)
    if (step === "confirm_complete") return (await confirmCompleteBooking(ctx, { bookingId: params.bookingId, type: params.type, page: params.page }), true)
    if (step === "reschedule_dates") return (await startRescheduleBooking(ctx, { bookingId: params.bookingId, type: params.type, page: params.page }), true)
    if (step === "reschedule_times") return (await selectRescheduleDate(ctx, { date: params.date }), true)
    if (step === "reschedule_confirm") return (await selectRescheduleTime(ctx, { time: params.time }), true)
  }

  if (flow === "stats") {
    if (step === "menu") return (await startStatsFlow(ctx), true)
    if (step === "period") return (await selectStatsPeriod(ctx, { period: params.period }), true)
  }

  if (flow === "blocking") {
    if (step === "branch") return (await startBlockingFlow(ctx), true)
    if (step === "date") return (await selectBlockingBranch(ctx, { branchId: params.branchId }), true)
    if (step === "actions") return (await selectBlockingDate(ctx, { date: params.date }), true)
    if (step === "times") return (await startBlockTimePick(ctx), true)
  }

  if (flow === "capacity") {
    if (step === "service") return (await startCapacityFlow(ctx), true)
    if (step === "level") return (await selectCapacityService(ctx, { serviceId: params.serviceId }), true)
    if (step === "date") return (await selectCapacityLevel(ctx, { serviceLevel: params.serviceLevel }), true)
    if (step === "summary") return (await selectCapacityDate(ctx, { date: params.date }), true)
  }

  return false
}

export const handleBack = async (ctx) => {
  await safeBackReply(ctx)

  // pop current screen
  popNav(ctx)

  // render previous
  const prev = peekNav(ctx)
  const ok = await route(ctx, prev)
  if (ok) return

  // No previous screen: keep user on current message (no main menu jumps)
  try {
    await ctx.answerCbQuery("Нет предыдущего шага", { show_alert: false })
  } catch {}
}

