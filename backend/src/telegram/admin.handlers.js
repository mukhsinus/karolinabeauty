// backend/src/telegram/admin.handlers.js
import { Markup } from "telegraf"
import Service from "../models/Service.js"
import Booking from "../models/Booking.js"
import Branch from "../models/Branch.js"
import { t } from "../utils/translate.js"

export const registerAdminHandlers = (bot, adminOnly) => {

  bot.hears(["🇷🇺 Русский", "🇺🇿 O'zbekcha"], async (ctx) => {

    await ctx.reply(
      "📱 Отправьте номер телефона",
      Markup.keyboard([
        Markup.button.contactRequest("📲 Отправить номер")
      ]).resize().oneTime()
    )

  })

  bot.on("contact", adminOnly, async (ctx) => {

    const branches = await Branch.find()

    const buttons = branches.map(b => [
      Markup.button.callback(`📍 ${b.name}`, `branch_${b._id}`)
    ])

    await ctx.reply(
      "Выберите филиал",
      Markup.inlineKeyboard(buttons)
    )

  })

  bot.action(/branch_(.+)/, adminOnly, async (ctx) => {

    await ctx.answerCbQuery()

    await ctx.reply(
      "Админ панель",
      Markup.keyboard([
        ["📅 Сегодняшние записи"],
        ["💰 Изменить цену"],
        ["🕐 Изменить часы работы"],
        ["📍 Изменить адрес филиала"]
      ]).resize()
    )

  })

  bot.hears("📅 Сегодняшние записи", adminOnly, async (ctx) => {

    const today = new Date().toISOString().slice(0,10)

    const bookings = await Booking.find({
      date: today,
      status: "confirmed"
    }).sort({ time: 1 })

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

  })

  bot.hears("💰 Изменить цену", adminOnly, async (ctx) => {

    const categories = await Service.distinct("category", {
      isActive: true
    })

    const buttons = categories.map(c => [
      Markup.button.callback(
        `📂 ${t(`services.${c}`)}`,
        `price_category_${c}`
      )
    ])

    await ctx.reply(
      "Выберите категорию",
      Markup.inlineKeyboard(buttons)
    )

  })

  bot.action(/price_category_(.+)/, adminOnly, async (ctx) => {

    await ctx.answerCbQuery()

    const category = ctx.match[1]

    const services = await Service.find({
      category,
      isActive: true
    })

    const buttons = services.map(s => [
      Markup.button.callback(
        `${t(s.nameKey)} (${s.price} сум)`,
        `price_service_${s._id}`
      )
    ])

    await ctx.reply(
      "Выберите услугу",
      Markup.inlineKeyboard(buttons)
    )

  })

  bot.action(/price_service_(.+)/, adminOnly, async (ctx) => {

    await ctx.answerCbQuery()

    const serviceId = ctx.match[1]

    const service = await Service.findById(serviceId)

    ctx.session = {
      flow: "change_price",
      serviceId
    }

    await ctx.reply(
`Текущая цена: ${service.price} сум

Введите новую цену

пример: 100000`
    )

  })

  bot.on("text", async (ctx, next) => {

    if (ctx.session?.flow !== "change_price") {
      return next()
    }

    if (!adminOnly(ctx, () => true)) return

    const price = Number(ctx.message.text)

    if (isNaN(price)) {
      return ctx.reply("Введите число")
    }

    const service = await Service.findById(ctx.session.serviceId)

    ctx.session.newPrice = price
    ctx.session.flow = "confirm_price"

    await ctx.reply(
`Вы изменяете цену услуги

${t(service.nameKey)}

Новая цена: ${price} сум

Подтвердить изменение?`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback("✅ Подтвердить", "confirm_price"),
          Markup.button.callback("❌ Отменить", "cancel_price")
        ]
      ])
    )

  })

  bot.action("confirm_price", adminOnly, async (ctx) => {

    await ctx.answerCbQuery()

    const { serviceId, newPrice } = ctx.session

    await Service.findByIdAndUpdate(
      serviceId,
      { price: newPrice }
    )

    ctx.session = null

    await ctx.reply(
      "✅ Цена успешно обновлена",
      Markup.keyboard([
        ["📅 Сегодняшние записи"],
        ["💰 Изменить цену"],
        ["🕐 Изменить часы работы"],
        ["📍 Изменить адрес филиала"]
      ]).resize()
    )

  })

  bot.action("cancel_price", adminOnly, async (ctx) => {

    await ctx.answerCbQuery()

    ctx.session = null

    await ctx.reply("Изменение отменено")

  })

  bot.hears("📍 Изменить адрес филиала", adminOnly, async (ctx) => {

    const branches = await Branch.find()

    const buttons = branches.map(b => [
      Markup.button.callback(
        b.name,
        `branch_edit_${b._id}`
      )
    ])

    await ctx.reply(
      "Выберите филиал",
      Markup.inlineKeyboard(buttons)
    )

  })

  bot.action(/branch_edit_(.+)/, adminOnly, async (ctx) => {

    await ctx.answerCbQuery()

    const id = ctx.match[1]

    ctx.session = {
      flow: "change_address",
      branchId: id
    }

    await ctx.reply("Введите новый адрес")

  })

  bot.on("text", async (ctx, next) => {

    if (ctx.session?.flow !== "change_address") {
      return next()
    }

    if (!adminOnly(ctx, () => true)) return

    const address = ctx.message.text

    await Branch.findByIdAndUpdate(
      ctx.session.branchId,
      { address }
    )

    ctx.session = null

    await ctx.reply("✅ Адрес обновлен")

  })

}