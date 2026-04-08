// src/telegram/core/guards.js

const ADMIN_IDS = (process.env.TELEGRAM_ADMIN_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter((id) => id.length > 0)
  .map((id) => Number(id))
  .filter((id) => Number.isFinite(id))

export const isAdmin = (ctx) => {
  const id = ctx.from?.id
  return ADMIN_IDS.includes(id)
}

// middleware вариант (если будешь использовать bot.use)
export const adminOnly = async (ctx, next) => {
  if (!isAdmin(ctx)) {
    await ctx.reply("⛔ Access denied")
    return
  }
  return next()
}

// utility (для if)
export const ensureAdmin = (ctx) => isAdmin(ctx)