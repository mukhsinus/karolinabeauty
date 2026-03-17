// src/telegram/bot.js
import dotenv from "dotenv"
dotenv.config()

import { Telegraf, session } from "telegraf"
import { registerCommands } from "./commands.js"
import { registerAdminHandlers } from "./admin.handlers.js"

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

bot.use(session())

const userRateMap = new Map()

const rateLimiter = (ctx, next) => {
  const id = ctx.from?.id
  const now = Date.now()
  const last = userRateMap.get(id) || 0

  if (now - last < 500) return

  userRateMap.set(id, now)
  return next()
}

bot.use(rateLimiter)

const ADMIN_IDS = process.env.TELEGRAM_ADMIN_IDS
  .split(",")
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

  try {
    await bot.telegram.deleteWebhook()
  } catch (e) {
    console.log("Webhook cleanup:", e.message)
  }

  bot.launch()

  console.log("Telegram bot started")
}

export const stopBot = () => {
  bot.stop()
  console.log("Telegram bot stopped")
}