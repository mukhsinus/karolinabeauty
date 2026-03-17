// src/telegram/flows/branch.flow.js

import { setStep } from "../core/session.js"
import { STEPS } from "../core/constants.js"

import { branchesInline } from "../keyboards/inline.keyboard.js"
import { adminKeyboard } from "../keyboards/admin.keyboard.js"

import { getBranches } from "../services/api.service.js"

// ================= CONTACT =================

export const handleContact = async (ctx) => {
  try {
    const phone = ctx.message.contact.phone_number
    ctx.session.phone = phone

    const branches = await getBranches()

    setStep(ctx, STEPS.BRANCH)

    const text =
      ctx.session.language === "uz"
        ? "Filialni tanlang"
        : "Выберите филиал"

    return ctx.reply(
      text,
      branchesInline(branches, "branch_select")
    )

  } catch (error) {
    console.error("handleContact error:", error)
    return ctx.reply("⚠️ Ошибка. Попробуйте снова")
  }
}

// ================= SELECT =================

export const handleBranchSelect = async (ctx, branchId) => {
  try {
    ctx.session.branchId = branchId

    setStep(ctx, STEPS.ADMIN_PANEL)

    await ctx.answerCbQuery()

    const text =
      ctx.session.language === "uz"
        ? "Admin panel"
        : "Админ панель"

    return ctx.reply(
      text,
      adminKeyboard()
    )

  } catch (error) {
    console.error("handleBranchSelect error:", error)
    return ctx.reply("⚠️ Ошибка. Попробуйте снова")
  }
}