// src/telegram/bot.js
import dotenv from "dotenv"
dotenv.config()

import { Telegraf, session } from "telegraf"
import { registerCommands } from "./commands.js"
import { registerAdminHandlers } from "./admin.handlers.js"

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

// ❗ защита от двойного запуска
let isStarted = false

bot.use(session())

const userRateMap = new Map()

const rateLimiter = (ctx, next) => {
  const id = ctx.from?.id
  if (!id) return next()

  const now = Date.now()
  const last = userRateMap.get(id) || 0

  if (now - last < 500) return

  userRateMap.set(id, now)
  return next()
}

bot.use(rateLimiter)

// ❗ защита от undefined
const ADMIN_IDS = (process.env.TELEGRAM_ADMIN_IDS || "")
  .split(",")
  .filter(Boolean)
  .map(id => Number(id))

const isAdmin = (ctx) => {
  const id = ctx.from?.id
  return ADMIN_IDS.includes(id)
}

const adminOnly = (ctx, next) => {
  if (!isAdmin(ctx)) {
    return ctx.reply("⛔ Access denied")
  }
  return next()
}

registerCommands(bot)
registerAdminHandlers(bot, adminOnly)

export const notifyNewBooking = async (booking) => {
  const message = `🔔 Новая запись

📅 ${booking.date} ${booking.time}

💅 ${booking.serviceName}

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

export const startBot = async () => {
  if (isStarted) {
    console.log("⚠️ Bot already started, skipping...")
    return
  }

  try {
    console.log("🧹 Cleaning webhook & pending updates...")
    await bot.telegram.deleteWebhook({ drop_pending_updates: true })
  } catch (e) {
    console.log("Webhook cleanup:", e.message)
  }

  try {
    await bot.launch()
    isStarted = true
    console.log("✅ Telegram bot started")
  } catch (e) {
    console.error("❌ Bot launch error:", e.message)
  }
}

export const stopBot = () => {
  if (!isStarted) return

  try {
    bot.stop()
    isStarted = false
    console.log("🛑 Telegram bot stopped")
  } catch (e) {
    console.error("Stop bot error:", e.message)
  }
}