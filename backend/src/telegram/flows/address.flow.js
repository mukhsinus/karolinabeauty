// src/telegram/flows/address.flow.js

import {
  setStep,
  setPayload
} from "../core/session.js"

import { STEPS } from "../core/constants.js"

import {
  branchesInline,
  confirmInline
} from "../keyboards/inline.keyboard.js"

import {
  getBranches,
  updateBranchAddress
} from "../services/api.service.js"

// ================= START =================

export const startAddressFlow = async (ctx) => {
  try {
    const branches = await getBranches()

    ctx.session.action = "CHANGE_ADDRESS"
    setStep(ctx, STEPS.BRANCH)

    const text =
      ctx.session.language === "uz"
        ? "Filialni tanlang"
        : "Выберите филиал"

    return ctx.reply(
      text,
      branchesInline(branches, "address_branch")
    )

  } catch (error) {
    console.error("startAddressFlow error:", error)
    return ctx.reply("⚠️ Ошибка. Попробуйте снова")
  }
}

// ================= SELECT BRANCH =================

export const handleAddressBranchSelect = async (ctx, branchId) => {
  try {
    const branches = await getBranches()
    const branch = branches.find(b => String(b._id) === String(branchId))

    if (!branch) {
      return ctx.reply("⚠️ Филиал не найден")
    }

    setPayload(ctx, { branchId })
    setStep(ctx, STEPS.WAITING_ADDRESS)

    await ctx.answerCbQuery()

    const text =
      ctx.session.language === "uz"
        ? `Hozirgi manzil:\n${branch.address}\n\nYangi manzilni kiriting`
        : `Текущий адрес:\n${branch.address}\n\nВведите новый адрес`

    return ctx.reply(text)

  } catch (error) {
    console.error("handleAddressBranchSelect error:", error)
    return ctx.reply("⚠️ Ошибка. Попробуйте снова")
  }
}

// ================= INPUT =================

export const handleAddressInput = async (ctx) => {
  try {
    const address = ctx.message.text?.trim()

    if (!address || address.length < 5) {
      return ctx.reply(
        ctx.session.language === "uz"
          ? "Manzil juda qisqa"
          : "Адрес слишком короткий"
      )
    }

    setPayload(ctx, { newAddress: address })
    setStep(ctx, STEPS.CONFIRM_ADDRESS)

    const text =
      ctx.session.language === "uz"
        ? `Yangi manzil:\n${address}\n\nTasdiqlaysizmi?`
        : `Новый адрес:\n${address}\n\nПодтвердить?`

    return ctx.reply(text, confirmInline("address"))

  } catch (error) {
    console.error("handleAddressInput error:", error)
    return ctx.reply("⚠️ Ошибка. Попробуйте снова")
  }
}

// ================= CONFIRM =================

export const confirmAddress = async (ctx) => {
  try {
    const { branchId, newAddress } = ctx.session.payload || {}

    if (!branchId || !newAddress) {
      setStep(ctx, STEPS.ADMIN_PANEL)
      await ctx.answerCbQuery()
      return ctx.reply("⚠️ Некорректные данные")
    }

    await updateBranchAddress(branchId, newAddress)

    setStep(ctx, STEPS.ADMIN_PANEL)

    await ctx.answerCbQuery()

    return ctx.reply(
      ctx.session.language === "uz"
        ? "✅ Manzil yangilandi"
        : "✅ Адрес обновлён"
    )

  } catch (error) {
    console.error("confirmAddress error:", error)
    return ctx.reply("⚠️ Ошибка при обновлении")
  }
}

// ================= CANCEL =================

export const cancelAddress = async (ctx) => {
  try {
    setStep(ctx, STEPS.ADMIN_PANEL)

    await ctx.answerCbQuery()

    return ctx.reply(
      ctx.session.language === "uz"
        ? "❌ Bekor qilindi"
        : "❌ Отменено"
    )

  } catch (error) {
    console.error("cancelAddress error:", error)
    return ctx.reply("⚠️ Ошибка")
  }
}