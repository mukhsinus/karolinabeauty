// src/telegram/flows/start.flow.js

import { setStep, resetSession } from "../core/session.js"
import { STEPS } from "../core/constants.js"
import { requestPhoneKeyboard } from "../keyboards/main.keyboard.js"

// ================= START =================

export const startFlow = async (ctx) => {
  try {
    resetSession(ctx)

    ctx.session.language = "ru"

    const name = ctx.from?.first_name || "Admin"

    setStep(ctx, STEPS.PHONE)

    const message = `👋 Добро пожаловать, ${name}

Это админ-панель Karolina Beauty

Отправьте номер телефона`

    return ctx.reply(message, requestPhoneKeyboard("ru"))
  } catch (error) {
    console.error("startFlow error:", error)

    return ctx.reply("⚠️ Ошибка запуска. Попробуйте снова")
  }
}
