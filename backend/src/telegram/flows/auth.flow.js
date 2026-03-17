// src/telegram/flows/auth.flow.js

import { setStep } from "../core/session.js"
import { STEPS } from "../core/constants.js"
import { requestPhoneKeyboard } from "../keyboards/main.keyboard.js"

// допустимые языки
const LANGUAGES = {
  "🇷🇺 Русский": "ru",
  "🇺🇿 O'zbekcha": "uz"
}

// ================= LANGUAGE =================

export const handleLanguage = async (ctx) => {
  try {
    const selected = ctx.message.text

    const lang = LANGUAGES[selected]

    // защита от "левого" текста
    if (!lang) {
      return ctx.reply("Пожалуйста, выберите язык через кнопки")
    }

    ctx.session.language = lang

    setStep(ctx, STEPS.PHONE)

    return ctx.reply(
      lang === "uz"
        ? "📱 Telefon raqamingizni yuboring"
        : "📱 Отправьте номер телефона",
      requestPhoneKeyboard()
    )

  } catch (error) {
    console.error("handleLanguage error:", error)

    return ctx.reply("⚠️ Ошибка. Попробуйте снова")
  }
}