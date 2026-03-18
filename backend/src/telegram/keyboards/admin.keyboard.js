// src/telegram/keyboards/admin.keyboard.js

import { Markup } from "telegraf"
import { BUTTONS } from "../core/constants.js"

export const adminKeyboard = (lang = "ru") => {

  const buttons =
    lang === "uz"
      ? [
          ["📅 Bugungi yozuvlar"],
          ["💰 Narxni o‘zgartirish"],
          ["🕐 Ish vaqtini o‘zgartirish"],
        ]
      : [
          [BUTTONS.BOOKINGS],
          [BUTTONS.PRICE],
          [BUTTONS.HOURS],
        ]

  return Markup.keyboard(buttons).resize()
}