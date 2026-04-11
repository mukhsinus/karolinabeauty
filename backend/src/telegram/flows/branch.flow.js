// src/telegram/flows/branch.flow.js

import { Markup } from "telegraf"

import { setStep, clearPayload, setPayload } from "../core/session.js"
import { STEPS } from "../core/constants.js"

import Branch from "../../models/Branch.js"
import { isPremiumLevelAllowedForBranch } from "../../utils/branchPremium.util.js"

import { branchesInline } from "../keyboards/inline.keyboard.js"
import { adminKeyboard } from "../keyboards/admin.keyboard.js"

import { getBranches } from "../services/api.service.js"

// ================= BRANCH SELECTION (re-entry from admin) =================

export const goBranchSelection = async (ctx) => {
  try {
    clearPayload(ctx)
    if (ctx.session) ctx.session.branchId = null

    const branches = await getBranches()

    setStep(ctx, STEPS.BRANCH)

    const text =
      ctx.session.language === "uz"
        ? "Filialni tanlang"
        : "Выберите филиал"

    await ctx.reply(text, Markup.removeKeyboard())
    // Second message carries inline keyboard (API cannot combine remove_keyboard + inline_keyboard).
    return ctx.reply("\u2060", branchesInline(branches, "branch_select"))
  } catch (error) {
    console.error("goBranchSelection error:", error)
    return ctx.reply("⚠️ Ошибка. Попробуйте снова")
  }
}

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

    const branch = await Branch.findById(branchId).select("slug name").lean()

    const booking = ctx.session?.payload?.booking
    if (booking?.serviceLevel === "premium" && !isPremiumLevelAllowedForBranch(branch, "premium")) {
      setPayload(ctx, {
        booking: {
          ...booking,
          serviceLevel: null
        }
      })
    }

    const capacity = ctx.session?.payload?.capacity
    if (capacity?.serviceLevel === "premium" && !isPremiumLevelAllowedForBranch(branch, "premium")) {
      setPayload(ctx, {
        capacity: {
          ...capacity,
          serviceLevel: null
        }
      })
    }

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