// src/telegram/bot.js
import dotenv from "dotenv"
dotenv.config()

import { Telegraf, session } from "telegraf"
import Branch from "../models/Branch.js"

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
  openBookingCard,
  confirmCancelBooking,
  confirmCompleteBooking,
  doCancelBooking,
  doCompleteBooking,
  showBookingMenu,
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
  selectCapacityBranch,
  selectCapacityService,
  selectCapacityLevel,
  selectCapacityDate,
  setCapacityValue,
  backCapacity
} from "./flows/capacity.flow.js"

import { startStatsFlow, selectStatsPeriod, showStats } from "./flows/stats.flow.js"

import {
  startAddressFlow,
  handleAddressBranchSelect,
  handleAddressInput,
  confirmAddress,
  cancelAddress
} from "./flows/address.flow.js"

import {
  startPriceFlow,
  handleCategorySelect,
  handleServiceSelect,
  handlePriceInput,
  confirmPrice,
  cancelPrice
} from "./flows/price.flow.js"

import {
  startHoursFlow,
  handleHoursInput,
  handleHoursBranchSelect,
  confirmHours,
  cancelHours
} from "./flows/hours.flow.js"

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

// branch (вход)
bot.action(/branch_select:(.+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return handleBranchSelect(ctx, ctx.match[1])
})

// hours branch
bot.action(/hours_branch:(.+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return handleHoursBranchSelect(ctx, ctx.match[1])
})

// address branch
bot.action(/address_branch:(.+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return handleAddressBranchSelect(ctx, ctx.match[1])
})

// price category
bot.action(/price_category:(.+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return handleCategorySelect(ctx, ctx.match[1])
})

// price service
bot.action(/price_service:(.+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return handleServiceSelect(ctx, ctx.match[1])
})

// confirm / cancel price
bot.action("confirm:price", async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return confirmPrice(ctx)
})

bot.action("cancel:price", async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return cancelPrice(ctx)
})

// confirm / cancel hours
bot.action("confirm:hours", async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return confirmHours(ctx)
})

bot.action("cancel:hours", async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return cancelHours(ctx)
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

bot.action("crm_booking:menu", async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return showBookingMenu(ctx)
})

bot.action(/crm_booking:list:(today|next7):(\d+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const type = ctx.match[1]
  const page = Number(ctx.match[2]) || 0
  return showBookingList(ctx, { type, page })
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

bot.action(/crm_booking:open:([^:]+):(today|next7):(\d+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const bookingId = ctx.match[1]
  const type = ctx.match[2]
  const page = Number(ctx.match[3]) || 0
  return openBookingCard(ctx, { bookingId, type, page })
})

bot.action(/crm_booking:cancel_confirm:([^:]+):(today|next7):(\d+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const bookingId = ctx.match[1]
  const type = ctx.match[2]
  const page = Number(ctx.match[3]) || 0
  return confirmCancelBooking(ctx, { bookingId, type, page })
})

bot.action(/crm_booking:complete_confirm:([^:]+):(today|next7):(\d+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const bookingId = ctx.match[1]
  const type = ctx.match[2]
  const page = Number(ctx.match[3]) || 0
  return confirmCompleteBooking(ctx, { bookingId, type, page })
})

bot.action(/crm_booking:cancel_do:([^:]+):(today|next7):(\d+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const bookingId = ctx.match[1]
  const type = ctx.match[2]
  const page = Number(ctx.match[3]) || 0
  return doCancelBooking(ctx, { bookingId, type, page })
})

bot.action(/crm_booking:complete_do:([^:]+):(today|next7):(\d+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const bookingId = ctx.match[1]
  const type = ctx.match[2]
  const page = Number(ctx.match[3]) || 0
  return doCompleteBooking(ctx, { bookingId, type, page })
})

bot.action(/crm_booking:reschedule_start:([^:]+):(today|next7):(\d+)/, async (ctx) => {
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

bot.action(/crm_capacity:branch:([^:]+)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const branchId = ctx.match[1]
  return selectCapacityBranch(ctx, { branchId })
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

bot.action(/crm_capacity:back:(branch|service|level|date|summary)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const step = ctx.match[1]
  return backCapacity(ctx, { step })
})

// ================= STATS (CRM) =================

bot.action("crm_stats:menu", async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  return startStatsFlow(ctx)
})

bot.action(/crm_stats:period:(today|next7)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const period = ctx.match[1]
  return selectStatsPeriod(ctx, { period })
})

bot.action(/crm_stats:group:(branch|service):(today|next7)/, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminAction(ctx)
  const group = ctx.match[1]
  const period = ctx.match[2]
  return showStats(ctx, { group, period })
})

bot.hears(BUTTONS.PRICE, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminMessage(ctx)
  return startPriceFlow(ctx)
})

bot.hears(BUTTONS.HOURS, async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminMessage(ctx)
  return startHoursFlow(ctx)
})

// ================= TEXT ROUTER =================

bot.on("text", async (ctx) => {
  if (!isAdmin(ctx)) return denyAdminMessage(ctx)

  const step = ctx.session.step

  switch (step) {

    case STEPS.WAITING_PRICE:
      return handlePriceInput(ctx)

    case STEPS.WAITING_HOURS:
      return handleHoursInput(ctx)

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
  .filter(Boolean)
  .map(id => Number(id))

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
    await bot.launch()
    isStarted = true
    console.log("✅ Bot started")
  } catch (e) {
    console.error("❌ Bot launch error:", e.message)
  }
}

export const stopBot = () => {
  if (!isStarted) return
  bot.stop()
  isStarted = false
}