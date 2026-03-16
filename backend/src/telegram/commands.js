// backens/src/telegram/commands.js
import { Markup } from "telegraf"

export const registerCommands = (bot) => {

  bot.start(async (ctx) => {

    const name = ctx.from?.first_name || "Admin"

    await ctx.reply(
`👋 Добро пожаловать, ${name}

Это админ-панель Karolina Beauty`,
      Markup.keyboard([
        ["🇷🇺 Русский", "🇺🇿 O'zbekcha"]
      ])
        .resize()
        .oneTime()
    )

  })

  bot.command("help", async (ctx) => {

    await ctx.reply(
`Доступные команды:

/start — перезапустить бота
/panel — открыть админ панель
/help — список команд`
    )

  })

  bot.command("panel", async (ctx) => {

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

}