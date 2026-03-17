// src/telegram/flows/admin.flow.js

import { t } from "../../utils/translate.js"
import { getTodayBookings } from "../services/api.service.js"

// ================= TODAY BOOKINGS =================

export const showTodayBookings = async (ctx) => {
  try {
    const bookings = await getTodayBookings()

    if (!bookings.length) {
      return ctx.reply("Сегодня записей нет")
    }

    for (const b of bookings) {
      await ctx.reply(
`📅 ${b.date} ${b.time}

👩 Клиент: ${b.name}
📞 ${b.phone}

💅 ${t(b.serviceName)}

💰 ${b.price} сум`
      )
    }

  } catch (error) {
    console.error("showTodayBookings error:", error)

    return ctx.reply("⚠️ Ошибка при загрузке записей")
  }
}