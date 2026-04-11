// src/telegram/flows/price.flow.js

import { t } from "../../utils/translate.js"

import {
  setStep,
  setPayload
} from "../core/session.js"

import { STEPS } from "../core/constants.js"

import {
  categoriesInline,
  servicesInline,
  confirmInline
} from "../keyboards/inline.keyboard.js"

import {
  getCategories,
  getServicesByCategory,
  getServiceById,
  updateServicePrice
} from "../services/api.service.js"
import {
  getMinPriceFromService,
  inferListingCurrency
} from "../../utils/servicePrice.util.js"

// ================= START =================

export const startPriceFlow = async (ctx) => {
  try {
    const categories = await getCategories()

    setStep(ctx, STEPS.PRICE_CATEGORY)

    const text =
      ctx.session.language === "uz"
        ? "Kategoriyani tanlang"
        : "Выберите категорию"

    return ctx.reply(
      text,
      categoriesInline(categories, t)
    )

  } catch (error) {
    console.error("startPriceFlow error:", error)
    return ctx.reply("⚠️ Ошибка. Попробуйте снова")
  }
}

// ================= CATEGORY =================

export const handleCategorySelect = async (ctx, category) => {
  try {
    const services = await getServicesByCategory(category)

    setStep(ctx, STEPS.PRICE_SERVICE)

    await ctx.answerCbQuery()

    const text =
      ctx.session.language === "uz"
        ? "Xizmatni tanlang"
        : "Выберите услугу"

    return ctx.reply(
      text,
      servicesInline(services, t)
    )

  } catch (error) {
    console.error("handleCategorySelect error:", error)
    return ctx.reply("⚠️ Ошибка. Попробуйте снова")
  }
}

// ================= SERVICE =================

export const handleServiceSelect = async (ctx, serviceId) => {
  try {
    const service = await getServiceById(serviceId)

    if (!service) {
      return ctx.reply("⚠️ Услуга не найдена")
    }

    setPayload(ctx, { serviceId })
    setStep(ctx, STEPS.WAITING_PRICE)

    await ctx.answerCbQuery()

    const min = getMinPriceFromService(service)
    const cur = inferListingCurrency(service)
    const uzUnit = cur === "USD" ? "USD" : "so'm"
    const ruUnit = cur === "USD" ? "USD" : "сум"
    const text =
      ctx.session.language === "uz"
        ? `Hozirgi narx (min): ${min ?? "-"} ${uzUnit}\n\nYangi narxni kiriting`
        : `Текущая цена (мин.): ${min ?? "-"} ${ruUnit}\n\nВведите новую цену`

    return ctx.reply(text)

  } catch (error) {
    console.error("handleServiceSelect error:", error)
    return ctx.reply("⚠️ Ошибка. Попробуйте снова")
  }
}

// ================= INPUT =================

export const handlePriceInput = async (ctx) => {
  try {
    const price = Number(ctx.message.text)

    if (isNaN(price) || price <= 0) {
      return ctx.reply(
        ctx.session.language === "uz"
          ? "Iltimos, to‘g‘ri son kiriting"
          : "Введите корректное число"
      )
    }

    setPayload(ctx, { newPrice: price })
    setStep(ctx, STEPS.CONFIRM_PRICE)

    const text =
      ctx.session.language === "uz"
        ? `Yangi narx: ${price} so'm\nTasdiqlaysizmi?`
        : `Новая цена: ${price} сум\nПодтвердить?`

    return ctx.reply(
      text,
      confirmInline("price")
    )

  } catch (error) {
    console.error("handlePriceInput error:", error)
    return ctx.reply("⚠️ Ошибка. Попробуйте снова")
  }
}

// ================= CONFIRM =================

export const confirmPrice = async (ctx) => {
  try {
    const { serviceId, newPrice } = ctx.session.payload || {}

    if (!serviceId || !newPrice) {
      setStep(ctx, STEPS.ADMIN_PANEL)
      await ctx.answerCbQuery()
      return ctx.reply("⚠️ Некорректные данные")
    }

    await updateServicePrice(serviceId, newPrice)

    setStep(ctx, STEPS.ADMIN_PANEL)

    await ctx.answerCbQuery()

    return ctx.reply(
      ctx.session.language === "uz"
        ? "✅ Narx yangilandi"
        : "✅ Цена обновлена"
    )

  } catch (error) {
    console.error("confirmPrice error:", error)
    return ctx.reply("⚠️ Ошибка при обновлении")
  }
}

// ================= CANCEL =================

export const cancelPrice = async (ctx) => {
  try {
    setStep(ctx, STEPS.ADMIN_PANEL)

    await ctx.answerCbQuery()

    return ctx.reply(
      ctx.session.language === "uz"
        ? "❌ Bekor qilindi"
        : "❌ Отменено"
    )

  } catch (error) {
    console.error("cancelPrice error:", error)
    return ctx.reply("⚠️ Ошибка")
  }
}