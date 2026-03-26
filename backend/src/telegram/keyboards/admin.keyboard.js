// src/telegram/keyboards/admin.keyboard.js

import { Markup } from "telegraf"
import { BUTTONS } from "../core/constants.js"

export const adminKeyboard = (lang = "ru") => {
  const buttons =
    lang === "uz"
      ? [
          [BUTTONS.BOOKINGS],
          [BUTTONS.STATS],
        ]
      : [
          [BUTTONS.BOOKINGS],
          [BUTTONS.STATS],
        ]

  return Markup.keyboard(buttons).resize()
}