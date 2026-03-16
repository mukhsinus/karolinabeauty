import dotenv from "dotenv"
dotenv.config()

import { Telegraf } from "telegraf"
import RedisSession from "telegraf-session-redis"
import { Queue, Worker } from "bullmq"
import IORedis from "ioredis"

import { registerCommands } from "./commands.js"
import { registerAdminHandlers } from "./admin.handlers.js"


const redis = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  maxRetriesPerRequest: null
})


const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)


const session = new RedisSession({
  store: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
})

bot.use(session)


const userRateMap = new Map()

const rateLimiter = (ctx, next) => {

  const id = ctx.from?.id
  const now = Date.now()

  const last = userRateMap.get(id) || 0

  if (now - last < 500) {
    return
  }

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

bot.use(adminOnly)


registerCommands(bot)

registerAdminHandlers(bot)


const notificationQueue = new Queue("telegram_notifications", {
  connection: redis
})

new Worker(
  "telegram_notifications",
  async job => {

    const booking = job.data

    const message =

`🔔 Новая запись

📅 ${booking.date} ${booking.time}

💅 ${booking.serviceName}

👩 ${booking.name}
📞 ${booking.phone}

💰 ${booking.price}`

    for (const id of ADMIN_IDS) {
      await bot.telegram.sendMessage(id, message)
    }

  },
  { connection: redis }
)


export const notifyNewBooking = async (booking) => {

  await notificationQueue.add(
    "send_notification",
    booking
  )

}


export const startBot = () => {

  bot.launch()

  console.log("Telegram bot started")

}

export const stopBot = () => {

  bot.stop()

  console.log("Telegram bot stopped")

}