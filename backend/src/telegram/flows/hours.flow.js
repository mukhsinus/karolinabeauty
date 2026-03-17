// src/telegram/flows/hours.flow.js

import { setStep, setPayload } from "../core/session.js"
import { STEPS } from "../core/constants.js"

import { branchesInline, confirmInline } from "../keyboards/inline.keyboard.js"

import { getBranches, updateBranchHours } from "../services/api.service.js"

// ================= START =================

export const startHoursFlow = async (ctx) => {
  try {
    const branches = await getBranches()

    // фиксируем контекст действия
    ctx.session.action = "CHANGE_HOURS"
    setStep(ctx, STEPS.BRANCH)

    const text =
      ctx.session.language === "uz"
        ? "Filialni tanlang"
        : "Выберите филиал"

    return ctx.reply(
      text,
      // важно: отдельный namespace для hours
      branchesInline(branches, "hours_branch")
    )
  } catch (error) {
    console.error("startHoursFlow error:", error)
    return ctx.reply("⚠️ Ошибка. Попробуйте снова")
  }
}

// ================= SELECT BRANCH =================

export const handleHoursBranchSelect = async (ctx, branchId) => {
  try {
    setPayload(ctx, { branchId })
    setStep(ctx, STEPS.WAITING_HOURS)

    await ctx.answerCbQuery()

    const text =
      ctx.session.language === "uz"
        ? "Yangi ish vaqtini kiriting\nmisol: 09:00 - 21:00"
        : "Введите новые часы работы\nпример: 09:00 - 21:00"

    return ctx.reply(text)
  } catch (error) {
    console.error("handleHoursBranchSelect error:", error)
    return ctx.reply("⚠️ Ошибка. Попробуйте снова")
  }
}

// ================= INPUT =================

export const handleHoursInput = async (ctx) => {
  try {
    const text = ctx.message.text?.trim()

    // базовая валидация формата
    if (!text || !text.includes("-")) {
      return ctx.reply(
        ctx.session.language === "uz"
          ? "Format noto‘g‘ri. Misol: 09:00 - 21:00"
          : "Неверный формат. Пример: 09:00 - 21:00"
      )
    }

    setPayload(ctx, { newHours: text })
    setStep(ctx, STEPS.CONFIRM_HOURS)

    const message =
      ctx.session.language === "uz"
        ? `Yangi ish vaqti: ${text}\nTasdiqlaysizmi?`
        : `Новые часы: ${text}\nПодтвердить?`

    return ctx.reply(message, confirmInline("hours"))
  } catch (error) {
    console.error("handleHoursInput error:", error)
    return ctx.reply("⚠️ Ошибка. Попробуйте снова")
  }
}

// ================= CONFIRM =================

export const confirmHours = async (ctx) => {
  try {
    const { branchId, newHours } = ctx.session.payload || {}

    if (!branchId || !newHours) {
      setStep(ctx, STEPS.ADMIN_PANEL)
      await ctx.answerCbQuery()
      return ctx.reply("⚠️ Некорректные данные. Повторите действие.")
    }

    await updateBranchHours(branchId, newHours)

    setStep(ctx, STEPS.ADMIN_PANEL)

    await ctx.answerCbQuery()

    return ctx.reply(
      ctx.session.language === "uz"
        ? "✅ Ish vaqti yangilandi"
        : "✅ Часы работы обновлены"
    )
  } catch (error) {
    console.error("confirmHours error:", error)
    return ctx.reply("⚠️ Ошибка при обновлении")
  }
}

// ================= CANCEL =================

export const cancelHours = async (ctx) => {
  try {
    setStep(ctx, STEPS.ADMIN_PANEL)

    await ctx.answerCbQuery()

    return ctx.reply(
      ctx.session.language === "uz"
        ? "❌ Bekor qilindi"
        : "❌ Изменение отменено"
    )
  } catch (error) {
    console.error("cancelHours error:", error)
    return ctx.reply("⚠️ Ошибка")
  }
}