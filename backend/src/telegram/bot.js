// src/telegram/bot.js
import dotenv from "dotenv"
dotenv.config()

import { Telegraf, session } from "telegraf"
import Branch from "../models/Branch.js"
import { acquireRuntimeLock, renewRuntimeLock, releaseRuntimeLock } from "./core/runtimeLock.js"

// core
import { initialSession, setStep } from "./core/session.js"
import { STEPS, BUTTONS } from "./core/constants.js"
import { isAdmin } from "./core/guards.js"

// flows
import { startFlow } from "./flows/start.flow.js"
import { handleLanguage } from "./flows/auth.flow.js"

import {
  handleContact,
  handleBranchSelect
} from "./flows/branch.flow.js"

// legacy admin.flow bookings kept, but CRM booking flow is now used
import {
  startBookingManagement,
  showBookingList,
  selectNext7Day,
  openBookingCard,
  confirmCancelBooking,
  confirmCompleteBooking,
  doCancelBooking,
  doCompleteBooking,
  startRescheduleBooking,
  selectRescheduleDate,
  selectRescheduleTime,
  doRescheduleBooking,
  backReschedule
} from "./flows/booking.flow.js"
import { selectBookingBranchFilter, selectBookingLevelFilter } from "./flows/booking.flow.js"

import {
  startBlockingFlow,
  selectBlockingBranch,
  selectBlockingDate,
  doBlockDay,
  startBlockTimePick,
  doBlockTime,
  doUnblockDay,
  doUnblockTime,
  backBlocking
} from "./flows/blocking.flow.js"

import {
  startCapacityFlow,
  selectCapacityCategory,
  selectCapacityService,
  selectCapacityLevel,
  selectCapacityDate,
  setCapacityValue,
  backCapacity
} from "./flows/capacity.flow.js"

import { startStatsFlow, selectStatsPeriod, selectStatsDay, selectStatsMonth } from "./flows/stats.flow.js"

import {
  startAddressFlow,
  handleAddressBranchSelect,
  handleAddressInput,
  confirmAddress,
  cancelAddress
} from "./flows/address.flow.js"

// keyboards
import { adminKeyboard } from "./keyboards/admin.keyboard.js"

const denyAdminAction = async (ctx) => {
  try {
    await ctx.answerCbQuery("⛔ Access denied", { show_alert: true })
  } catch {}
}

const denyAdminMessage = async (ctx) => {
  try {
    await ctx.reply("⛔ Access denied")
  } catch {}
}

// ================= INIT =================

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

let isStarted = false
let lockRenewTimer = null
const BOT_LOCK_KEY = "telegram_polling"

// ================= SESSION =================

bot.use(session())

bot.use((ctx, next) => {
  if (!ctx.session) {
    ctx.session = initialSession()
  }
  return next()
})

// ================= RATE LIMIT =================

const userRateMap = new Map()

bot.use((ctx, next) => {
  const id = ctx.from?.id
  if (!id) return next()

  const now = Date.now()
  const last = userRateMap.get(id) || 0

  if (now - last < 300) return

  userRateMap.set(id, now)
  return next()
})

// ================= START =================

bot.start(startFlow)

// ================= LANGUAGE =================

bot.hears(["🇷🇺 Русский", "🇺🇿 O'zbekcha"], async (ctx) => {
  if (ctx.session.step !== STEPS.LANGUAGE) return
  return handleLanguage(ctx)
})

// ================= CONTACT =================

bot.on("contact", async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminMessage(ctx)
  if (ctx.session.step !== STEPS.PHONE) return

  return handleContact(ctx)
})

// ================= CALLBACKS =================

const goAdminPanel = async (ctx) => {
  setStep(ctx, STEPS.ADMIN_PANEL)
  try {
    await ctx.reply(
      ctx.session.language === "uz" ? "Siz admin paneldasiz" : "Вы в админ панели",
      adminKeyboard(ctx.session.language)
    )
  } catch {}
}

const handleInlineBack = async (ctx, backKey) => {
  try {
    await ctx.answerCbQuery()
  } catch {}

  // If session is broken, always fallback to admin panel
  if (!ctx.session) return goAdminPanel(ctx)

  switch (backKey) {
    case "admin":
      return goAdminPanel(ctx)

    // ===== BOOKINGS =====
    case "booking_level":
      return startBookingManagement(ctx)
    case "booking_period": {
      const lvl = ctx.session?.payload?.booking?.serviceLevel
      if (!lvl) return startBookingManagement(ctx)
      return selectBookingLevelFilter(ctx, { serviceLevel: lvl })
    }
    case "booking_day_picker":
      return showBookingList(ctx, { type: "next7", page: 0 })
    case "booking_list": {
      const type = ctx.session?.payload?.booking?.type || "today"
      const page = Number(ctx.session?.payload?.booking?.page || 0)
      return showBookingList(ctx, { type, page })
    }
    case "booking_card": {
      const bookingId = ctx.session?.payload?.booking?.selectedBookingId
      const type = ctx.session?.payload?.booking?.type || "today"
      const page = Number(ctx.session?.payload?.booking?.page || 0)
      if (!bookingId) return showBookingList(ctx, { type, page })
      return openBookingCard(ctx, { bookingId, type, page })
    }
    case "reschedule_dates": {
      const rs = ctx.session?.payload?.booking?.reschedule
      if (!rs?.bookingId) return handleInlineBack(ctx, "booking_card")
      return startRescheduleBooking(ctx, { bookingId: rs.bookingId, type: rs.type || "today", page: rs.page || 0 })
    }
    case "reschedule_times": {
      const rs = ctx.session?.payload?.booking?.reschedule
      if (!rs?.date) return handleInlineBack(ctx, "reschedule_dates")
      return selectRescheduleDate(ctx, { date: rs.date })
    }

    // ===== STATS =====
    case "stats_menu":
      return startStatsFlow(ctx)

    // ===== CAPACITY =====
    case "capacity_categories":
      return startCapacityFlow(ctx)
    case "capacity_services": {
      const c = ctx.session?.payload?.capacity?.category
      if (!c) return startCapacityFlow(ctx)
      return selectCapacityCategory(ctx, { category: c })
    }
    case "capacity_levels": {
      const sid = ctx.session?.payload?.capacity?.serviceId
      if (!sid) return startCapacityFlow(ctx)
      return selectCapacityService(ctx, { serviceId: sid })
    }
    case "capacity_dates": {
      const lvl = ctx.session?.payload?.capacity?.serviceLevel
      if (!lvl) return startCapacityFlow(ctx)
      return selectCapacityLevel(ctx, { serviceLevel: lvl })
    }

    // ===== BLOCKING =====
    case "blocking_branch":
      return startBlockingFlow(ctx)
    case "blocking_date": {
      const bid = ctx.session?.payload?.blocking?.branchId
      if (!bid) return startBlockingFlow(ctx)
      return selectBlockingBranch(ctx, { branchId: bid })
    }
    case "blocking_actions": {
      const date = ctx.session?.payload?.blocking?.date
      if (!date) return handleInlineBack(ctx, "blocking_date")
      return selectBlockingDate(ctx, { date })
    }

    default:
      return goAdminPanel(ctx)
  }
}

bot.action(/crm_back:(.+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const backKey = String(ctx.match[1] || "")
  return handleInlineBack(ctx, backKey)
})

// branch (вход)
bot.action(/branch_select:(.+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return handleBranchSelect(ctx, ctx.match[1])
})

// address branch
bot.action(/address_branch:(.+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return handleAddressBranchSelect(ctx, ctx.match[1])
})

// confirm / cancel address
bot.action("confirm:address", async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return confirmAddress(ctx)
})

bot.action("cancel:address", async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return cancelAddress(ctx)
})

// ================= ADMIN =================

bot.hears(BUTTONS.BOOKINGS, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminMessage(ctx)
  return startBookingManagement(ctx)
})

bot.hears(BUTTONS.MASTERS, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminMessage(ctx)
  return startCapacityFlow(ctx)
})

bot.hears(BUTTONS.BACK, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminMessage(ctx)

  // Global fallback back: route by current step
  const step = ctx.session?.step
  switch (step) {
    case STEPS.CRM_BOOKING_PERIOD:
    case STEPS.CRM_BOOKING_DAY_PICKER:
    case STEPS.CRM_BOOKING_LIST:
    case STEPS.CRM_BOOKING_CARD:
    case STEPS.CRM_BOOKING_CONFIRM:
    case STEPS.CRM_RESCHEDULE_DATES:
    case STEPS.CRM_RESCHEDULE_TIMES:
    case STEPS.CRM_RESCHEDULE_CONFIRM:
      return startBookingManagement(ctx)

    case STEPS.CRM_CAPACITY_CATEGORY:
    case STEPS.CRM_CAPACITY_SERVICE:
    case STEPS.CRM_CAPACITY_LEVEL:
    case STEPS.CRM_CAPACITY_DATE:
    case STEPS.CRM_CAPACITY_SUMMARY:
      return startCapacityFlow(ctx)

    case STEPS.CRM_STATS_MENU:
    case STEPS.CRM_STATS_PERIOD:
      return goAdminPanel(ctx)

    case STEPS.CRM_BLOCKING_BRANCH:
    case STEPS.CRM_BLOCKING_DATE:
    case STEPS.CRM_BLOCKING_ACTIONS:
    case STEPS.CRM_BLOCKING_TIMES:
      return goAdminPanel(ctx)

    default:
      return goAdminPanel(ctx)
  }
})

// quick entrypoint for blocking CRM
bot.command("blocking", async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminMessage(ctx)
  return startBlockingFlow(ctx)
})

bot.command("capacity", async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminMessage(ctx)
  return startCapacityFlow(ctx)
})

bot.command("stats", async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminMessage(ctx)
  return startStatsFlow(ctx)
})

// ================= BOOKINGS (CRM) =================

// crm_booking:menu removed (reply keyboard main menu)

bot.action(/crm_booking:list:(today|next7|day):(\d+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const type = ctx.match[1]
  const page = Number(ctx.match[2]) || 0
  return showBookingList(ctx, { type, page })
})

bot.action(/crm_booking:day_select:(\d{4}-\d{2}-\d{2})/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const date = ctx.match[1]
  return selectNext7Day(ctx, { date })
})

bot.action(/crm_booking:filter_branch:([^:]+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const branchId = ctx.match[1]
  return selectBookingBranchFilter(ctx, { branchId })
})

bot.action(/crm_booking:filter_level:(master|top|premium)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const serviceLevel = ctx.match[1]
  return selectBookingLevelFilter(ctx, { serviceLevel })
})

bot.action(/crm_booking:open:([^:]+):(today|next7|day):(\d+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const bookingId = ctx.match[1]
  const type = ctx.match[2]
  const page = Number(ctx.match[3]) || 0
  return openBookingCard(ctx, { bookingId, type, page })
})

bot.action(/crm_booking:cancel_confirm:([^:]+):(today|next7|day):(\d+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const bookingId = ctx.match[1]
  const type = ctx.match[2]
  const page = Number(ctx.match[3]) || 0
  return confirmCancelBooking(ctx, { bookingId, type, page })
})

bot.action(/crm_booking:complete_confirm:([^:]+):(today|next7|day):(\d+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const bookingId = ctx.match[1]
  const type = ctx.match[2]
  const page = Number(ctx.match[3]) || 0
  return confirmCompleteBooking(ctx, { bookingId, type, page })
})

bot.action(/crm_booking:cancel_do:([^:]+):(today|next7|day):(\d+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const bookingId = ctx.match[1]
  const type = ctx.match[2]
  const page = Number(ctx.match[3]) || 0
  return doCancelBooking(ctx, { bookingId, type, page })
})

bot.action(/crm_booking:complete_do:([^:]+):(today|next7|day):(\d+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const bookingId = ctx.match[1]
  const type = ctx.match[2]
  const page = Number(ctx.match[3]) || 0
  return doCompleteBooking(ctx, { bookingId, type, page })
})

bot.action(/crm_booking:reschedule_start:([^:]+):(today|next7|day):(\d+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const bookingId = ctx.match[1]
  const type = ctx.match[2]
  const page = Number(ctx.match[3]) || 0
  return startRescheduleBooking(ctx, { bookingId, type, page })
})

bot.action(/crm_booking:reschedule_date:(\d{4}-\d{2}-\d{2})/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const date = ctx.match[1]
  return selectRescheduleDate(ctx, { date })
})

bot.action(/crm_booking:reschedule_time:(\d{2}:\d{2})/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const time = ctx.match[1]
  return selectRescheduleTime(ctx, { time })
})

bot.action("crm_booking:reschedule_do", async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return doRescheduleBooking(ctx)
})

bot.action(/crm_booking:reschedule_back:(card|dates|times)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const step = ctx.match[1]
  return backReschedule(ctx, { step })
})

// ================= BLOCKING (CRM) =================

bot.action(/crm_blocking:branch:([^:]+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const branchId = ctx.match[1]
  return selectBlockingBranch(ctx, { branchId })
})

bot.action(/crm_blocking:date:(\d{4}-\d{2}-\d{2})/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const date = ctx.match[1]
  return selectBlockingDate(ctx, { date })
})

bot.action("crm_blocking:block_day", async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return doBlockDay(ctx)
})

bot.action("crm_blocking:block_time_pick", async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return startBlockTimePick(ctx)
})

bot.action(/crm_blocking:time:(\d{2}:\d{2})/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const time = ctx.match[1]
  return doBlockTime(ctx, { time })
})

bot.action("crm_blocking:unblock_day", async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return doUnblockDay(ctx)
})

bot.action(/crm_blocking:unblock_time:(\d{2}:\d{2})/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const time = ctx.match[1]
  return doUnblockTime(ctx, { time })
})

bot.action(/crm_blocking:back:(branch|date|actions)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const step = ctx.match[1]
  return backBlocking(ctx, { step })
})

// ================= CAPACITY (CRM) =================

bot.action(/crm_capacity:category:([^:]+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const category = ctx.match[1]
  return selectCapacityCategory(ctx, { category })
})

bot.action(/crm_capacity:service:([^:]+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const serviceId = ctx.match[1]
  return selectCapacityService(ctx, { serviceId })
})

bot.action(/crm_capacity:level:(master|top|premium)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const serviceLevel = ctx.match[1]
  return selectCapacityLevel(ctx, { serviceLevel })
})

bot.action(/crm_capacity:date:(\d{4}-\d{2}-\d{2})/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const date = ctx.match[1]
  return selectCapacityDate(ctx, { date })
})

bot.action(/crm_capacity:set:([1-5])/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const value = Number(ctx.match[1])
  return setCapacityValue(ctx, { value })
})

bot.action(/crm_capacity:back:(category|service|level|date|summary)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const step = ctx.match[1]
  return backCapacity(ctx, { step })
})

// ================= STATS (CRM) =================

bot.action("crm_stats:menu", async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return startStatsFlow(ctx)
})

bot.action(/crm_stats:period:(today|month|year)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const period = ctx.match[1]
  return selectStatsPeriod(ctx, { period })
})

bot.action(/crm_stats:day:(\d{4}-\d{2}-\d{2})/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const date = ctx.match[1]
  return selectStatsDay(ctx, { date })
})

bot.action(/crm_stats:month:(\d{4}-\d{2})/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const yearMonth = ctx.match[1]
  return selectStatsMonth(ctx, { yearMonth })
})

// crm_stats:group removed (only by-branch supported)

bot.hears(BUTTONS.STATS, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminMessage(ctx)
  return startStatsFlow(ctx)
})

// ================= TEXT ROUTER =================

bot.on("text", async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminMessage(ctx)

  const step = ctx.session.step

  switch (step) {
    default:
      setStep(ctx, STEPS.ADMIN_PANEL)

      return ctx.reply(
        ctx.session.language === "uz"
          ? "Siz admin paneldasiz"
          : "Вы в админ панели",
        adminKeyboard(ctx.session.language)
      )
  }
})

// ================= ERROR =================

bot.catch((err, ctx) => {
  console.error("BOT ERROR:", err)
  return ctx.reply("⚠️ Произошла ошибка. Попробуйте снова.")
})

// ================= NOTIFICATIONS =================

const ADMIN_IDS = (process.env.TELEGRAM_ADMIN_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter((id) => id.length > 0)
  .map((id) => Number(id))
  .filter((id) => Number.isFinite(id))

export const notifyNewBooking = async (booking) => {
  let branchName = ""
  try {
    const branch = await Branch.findById(booking.branchId).lean()
    branchName = branch?.name || ""
  } catch (e) {
    console.error("Branch fetch for telegram error:", e.message)
  }

  const message = `🔔 Новая запись

📅 ${booking.date} ${booking.time}

📍 ${branchName || "-"}

💅 ${booking.serviceName}
⭐ ${booking.serviceLevel || "-"}

👩 ${booking.name}
📞 ${booking.phone}

💰 ${booking.price}`

  for (const id of ADMIN_IDS) {
    try {
      await bot.telegram.sendMessage(id, message)
    } catch (e) {
      console.error("Telegram send error:", e.message)
    }
  }
}

// ================= START / STOP =================

export const startBot = async () => {
  if (isStarted) return

  try {
    await bot.telegram.deleteWebhook({ drop_pending_updates: true })
  } catch {}

  try {
    const ttlSec = Number(process.env.BOT_LOCK_TTL_SEC || 55)
    const lock = await acquireRuntimeLock({ key: BOT_LOCK_KEY, ttlSec })
    if (!lock.acquired) {
      console.warn("Telegram bot lock is held by another instance. Skipping polling start.")
      return
    }

    await bot.launch()
    isStarted = true
    console.log("✅ Bot started")

    const renewEveryMs = Math.max(10000, Math.floor((ttlSec * 1000) / 2))
    lockRenewTimer = setInterval(async () => {
      try {
        const r = await renewRuntimeLock({ key: BOT_LOCK_KEY, ttlSec })
        if (!r.ok) {
          console.error("Lost Telegram bot lock. Stopping bot to avoid conflicts.")
          stopBot()
        }
      } catch (e) {
        console.error("Telegram bot lock renew error:", e?.message || e)
      }
    }, renewEveryMs)
  } catch (e) {
    console.error("❌ Bot launch error:", e.message)
    try {
      await releaseRuntimeLock({ key: BOT_LOCK_KEY })
    } catch {}
  }
}

export const stopBot = () => {
  if (!isStarted) return
  if (lockRenewTimer) {
    clearInterval(lockRenewTimer)
    lockRenewTimer = null
  }
  bot.stop()
  isStarted = false
  void releaseRuntimeLock({ key: BOT_LOCK_KEY })
}