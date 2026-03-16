// backend/src/telegram/admin.handlers.js
import { Markup } from "telegraf"
import Service from "../models/Service.js"
import Booking from "../models/Booking.js"
import Branch from "../models/Branch.js"
import { t } from "../utils/translate.js"

export const registerAdminHandlers = (bot) => {

  /*
  LANGUAGE
  */

  bot.hears(["🇷🇺 Русский", "🇺🇿 O'zbekcha"], async (ctx) => {

    await ctx.reply(
      "📱 Отправьте номер телефона",
      Markup.keyboard([
        Markup.button.contactRequest("📲 Отправить номер")
      ]).resize().oneTime()
    )

  })


  /*
  PHONE
  */

  bot.on("contact", async (ctx) => {

    const branches = await Branch.find()

    const buttons = branches.map(b => [
      Markup.button.callback(`📍 ${b.name}`, `branch_${b._id}`)
    ])

    await ctx.reply(
      "Выберите филиал",
      Markup.inlineKeyboard(buttons)
    )

  })


  /*
  BRANCH SELECT
  */

  bot.action(/branch_(.+)/, async (ctx) => {

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


  /*
  TODAY BOOKINGS
  */

  bot.hears("📅 Сегодняшние записи", async (ctx) => {

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


  /*
  CHANGE PRICE → CATEGORY
  */

  bot.hears("💰 Изменить цену", async (ctx) => {

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


  /*
  CATEGORY → SERVICES
  */

  bot.action(/price_category_(.+)/, async (ctx) => {

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


  /*
  SERVICE SELECT
  */

  bot.action(/price_service_(.+)/, async (ctx) => {

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


  /*
  NEW PRICE INPUT
  */

  bot.on("text", async (ctx, next) => {

    if (ctx.session?.flow !== "change_price") {
      return next()
    }

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


  /*
  CONFIRM PRICE
  */

  bot.action("confirm_price", async (ctx) => {

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


  /*
  CANCEL PRICE
  */

  bot.action("cancel_price", async (ctx) => {

    await ctx.answerCbQuery()

    ctx.session = null

    await ctx.reply("Изменение отменено")

  })


  /*
  CHANGE ADDRESS
  */

  bot.hears("📍 Изменить адрес филиала", async (ctx) => {

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


  bot.action(/branch_edit_(.+)/, async (ctx) => {

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

    const address = ctx.message.text

    await Branch.findByIdAndUpdate(
      ctx.session.branchId,
      { address }
    )

    ctx.session = null

    await ctx.reply("✅ Адрес обновлен")

  })

}