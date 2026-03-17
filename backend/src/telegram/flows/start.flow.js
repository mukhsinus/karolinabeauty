// src/telegram/flows/start.flow.js

import { setStep, resetSession } from "../core/session.js"
import { STEPS } from "../core/constants.js"
import { languageKeyboard } from "../keyboards/main.keyboard.js"

// ================= START =================

export const startFlow = async (ctx) => {
  try {
    // полностью сбрасываем состояние
    resetSession(ctx)

    const name = ctx.from?.first_name || "Admin"

    setStep(ctx, STEPS.LANGUAGE)

    // универсальный стартовый текст
    const message = `👋 Добро пожаловать, ${name}

Это админ-панель Karolina Beauty

Выберите язык:`

    return ctx.reply(message, languageKeyboard())

  } catch (error) {
    console.error("startFlow error:", error)

    return ctx.reply("⚠️ Ошибка запуска. Попробуйте снова")
  }
}