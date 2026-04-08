// src/telegram/keyboards/main.keyboard.js

import { Markup } from "telegraf"

export const requestPhoneKeyboard = (lang = "ru") => {
  return Markup.keyboard([
    [
      Markup.button.contactRequest(
        lang === "uz"
          ? "📲 Raqamni yuborish"
          : "📲 Отправить номер"
      )
    ]
  ])
    .resize()
    .oneTime()
}