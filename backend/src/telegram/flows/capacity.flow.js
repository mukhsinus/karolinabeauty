// backend/src/telegram/flows/capacity.flow.js

import { setPayload, setStep } from "../core/session.js"
import Branch from "../../models/Branch.js"
import {
  getCategories,
  getServicesByCategory,
  getCatalogServiceById
} from "../services/api.service.js"
import { isPremiumLevelAllowedForBranch } from "../../utils/branchPremium.util.js"
import { pushNav, resetNav } from "../core/nav.js"
import { formatDate } from "../utils/date.js"
import { translateService } from "../utils/serviceI18n.js"
import { STEPS } from "../core/constants.js"

import { getSlotCapacity, upsertSlotCapacity } from "../../services/capacity.service.js"
import { isKnownPriceLevel } from "../../constants/serviceLevels.js"

import {
  categoriesKeyboard,
  servicesKeyboard,
  levelsKeyboard,
  datesKeyboard,
  capacityKeyboard
} from "../keyboards/capacity.keyboard.js"

const safeErrorReply = async (ctx) => {
  try {
    await ctx.answerCbQuery("Ошибка")
  } catch {}
  try {
    await ctx.reply("⚠️ Ошибка. Попробуйте снова")
  } catch {}
}

const isValidObjectId = (id) =>
  typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id)

async function loadSessionBranchForCapacity(ctx) {
  const bid = ctx.session?.branchId || ctx.session?.payload?.capacity?.branchId
  if (!bid || !isValidObjectId(String(bid))) return null
  return Branch.findById(bid).select("slug name").lean()
}
const isDateISO = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s)

const toISODate = (d) => d.toISOString().slice(0, 10)
const getNextDays = (count) => {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < count; i++) {
    const x = new Date(today)
    x.setDate(today.getDate() + i)
    days.push(toISODate(x))
  }
  return days
}

const renderSummary = async (ctx) => {
  const p = ctx.session?.payload?.capacity
  if (!p) return safeErrorReply(ctx)

  const { branchId, serviceId, serviceLevel, date } = p
  if (!isValidObjectId(branchId) || !isValidObjectId(serviceId) || !serviceLevel || !isDateISO(date)) {
    return safeErrorReply(ctx)
  }

  const service = await getCatalogServiceById(serviceId)
  const lang = ctx.session?.language || "ru"
  const capacity = await getSlotCapacity({ branchId, serviceId, serviceLevel, date })
  await ctx.editMessageText(
    `👨‍🔧 Мастера\n\n💇 Услуга: ${translateService(service?.nameKey || "-", lang)}\n⭐ Уровень: ${serviceLevel}\n📅 Дата: ${formatDate(date)}\n\nСейчас: ${capacity}\n\nВыберите количество (1–5):`,
    capacityKeyboard()
  )
}

export const startCapacityFlow = async (ctx) => {
  try {
    resetNav(ctx)
    setPayload(ctx, { flow: "capacity" })
    setStep(ctx, STEPS.CRM_CAPACITY_CATEGORY)
    const branchId = ctx.session?.branchId || null
    if (!isValidObjectId(branchId)) {
      return ctx.reply("⚠️ Сначала выберите филиал при входе (/start).")
    }

    setPayload(ctx, {
      capacity: {
        branchId,
        category: null,
        serviceId: null,
        serviceLevel: null,
        date: null
      }
    })

    const categories = await getCategories()
    const sorted = (categories || []).map(String).sort((a, b) => a.localeCompare(b))
    if (!sorted.length) return ctx.reply("⚠️ Нет активных категорий")

    pushNav(ctx, { flow: "capacity", step: "category" })
    const lang = ctx.session?.language || "ru"
    try {
      await ctx.editMessageText("Выберите категорию:", categoriesKeyboard(sorted, lang))
    } catch {
      await ctx.reply("Выберите категорию:", categoriesKeyboard(sorted, lang))
    }
    return
  } catch (error) {
    console.error("[CRM] startCapacityFlow error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectCapacityCategory = async (ctx, { category }) => {
  try {
    setPayload(ctx, { flow: "capacity" })
    setStep(ctx, STEPS.CRM_CAPACITY_SERVICE)
    const c = String(category || "")
    if (!c) return safeErrorReply(ctx)

    setPayload(ctx, {
      capacity: {
        ...ctx.session.payload.capacity,
        category: c,
        serviceId: null,
        serviceLevel: null,
        date: null
      }
    })

    const services = await getServicesByCategory(c)
    const sortedServices = [...services].sort((a, b) =>
      String(a.nameKey).localeCompare(String(b.nameKey))
    )

    if (!sortedServices?.length) {
      return ctx.editMessageText("⚠️ Нет услуг в этой категории")
    }

    pushNav(ctx, { flow: "capacity", step: "service", params: { category: c } })
    const lang = ctx.session?.language || "ru"
    return ctx.editMessageText(
      "Выберите услугу:",
      servicesKeyboard(sortedServices, lang)
    )
  } catch (error) {
    console.error("[CRM] selectCapacityCategory error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectCapacityService = async (ctx, { serviceId }) => {
  try {
    setPayload(ctx, { flow: "capacity" })
    setStep(ctx, STEPS.CRM_CAPACITY_LEVEL)
    if (!isValidObjectId(serviceId)) return safeErrorReply(ctx)

    setPayload(ctx, {
      capacity: {
        ...ctx.session.payload.capacity,
        branchId: ctx.session?.branchId || ctx.session.payload.capacity?.branchId,
        serviceId,
        serviceLevel: null,
        date: null
      }
    })

    pushNav(ctx, { flow: "capacity", step: "level", params: { serviceId } })
    const branch = await loadSessionBranchForCapacity(ctx)
    const svc = await getCatalogServiceById(serviceId)
    return ctx.editMessageText("Выберите уровень:", levelsKeyboard(branch, svc))
  } catch (error) {
    console.error("[CRM] selectCapacityService error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectCapacityLevel = async (ctx, { serviceLevel }) => {
  try {
    if (!isKnownPriceLevel(serviceLevel)) return safeErrorReply(ctx)

    const branch = await loadSessionBranchForCapacity(ctx)
    if (!isPremiumLevelAllowedForBranch(branch, serviceLevel)) {
      try {
        await ctx.answerCbQuery("Премиум только в филиале Юнусабад", { show_alert: true })
      } catch {}
      setPayload(ctx, { flow: "capacity" })
      setStep(ctx, STEPS.CRM_CAPACITY_LEVEL)
      const sid = ctx.session?.payload?.capacity?.serviceId
      const svc = sid ? await getCatalogServiceById(sid) : null
      return ctx.editMessageText("Выберите уровень:", levelsKeyboard(branch, svc))
    }

    setPayload(ctx, { flow: "capacity" })
    setStep(ctx, STEPS.CRM_CAPACITY_DATE)

    setPayload(ctx, {
      capacity: {
        ...ctx.session.payload.capacity,
        serviceLevel,
        date: null
      }
    })

    const dates = getNextDays(14)
    pushNav(ctx, { flow: "capacity", step: "date", params: { serviceLevel } })
    return ctx.editMessageText("Выберите дату:", datesKeyboard(dates))
  } catch (error) {
    console.error("[CRM] selectCapacityLevel error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectCapacityDate = async (ctx, { date }) => {
  try {
    setPayload(ctx, { flow: "capacity" })
    setStep(ctx, STEPS.CRM_CAPACITY_SUMMARY)
    if (!isDateISO(date)) return safeErrorReply(ctx)

    setPayload(ctx, {
      capacity: {
        ...ctx.session.payload.capacity,
        date
      }
    })

    pushNav(ctx, { flow: "capacity", step: "summary", params: { date } })
    return renderSummary(ctx)
  } catch (error) {
    console.error("[CRM] selectCapacityDate error:", error)
    return safeErrorReply(ctx)
  }
}

export const setCapacityValue = async (ctx, { value }) => {
  try {
    const v = Number(value)
    if (!Number.isFinite(v) || v < 1 || v > 5) return safeErrorReply(ctx)

    const p = ctx.session?.payload?.capacity
    if (!p) return safeErrorReply(ctx)

    const { branchId, serviceId, serviceLevel, date } = p
    if (!isValidObjectId(branchId) || !isValidObjectId(serviceId) || !serviceLevel || !isDateISO(date)) {
      return safeErrorReply(ctx)
    }

    await upsertSlotCapacity({
      branchId,
      serviceId,
      serviceLevel,
      date,
      capacity: v
    })

    try {
      await ctx.answerCbQuery("Сохранено")
    } catch {}

    try {
      await ctx.editMessageText(`✅ На ${formatDate(date)} установлено ${v} мастера(ов)`, capacityKeyboard())
    } catch {
      // fallback to summary if we cannot edit this message
      return renderSummary(ctx)
    }
    return
  } catch (error) {
    console.error("[CRM] setCapacityValue error:", error)
    return safeErrorReply(ctx)
  }
}

export const backCapacity = async (ctx, { step }) => {
  try {
    const p = ctx.session?.payload?.capacity
    if (!p) return safeErrorReply(ctx)

    if (step === "category") return startCapacityFlow(ctx)

    if (step === "service") {
      const c = p.category
      if (!c) return startCapacityFlow(ctx)
      const services = await getServicesByCategory(c)
      const sortedServices = [...services].sort((a, b) =>
        String(a.nameKey).localeCompare(String(b.nameKey))
      )
      const lang = ctx.session?.language || "ru"
      return ctx.editMessageText(
        "Выберите услугу:",
        servicesKeyboard(sortedServices, lang)
      )
    }

    if (step === "level") {
      const branch = await loadSessionBranchForCapacity(ctx)
      const svc = await getCatalogServiceById(p.serviceId)
      return ctx.editMessageText("Выберите уровень:", levelsKeyboard(branch, svc))
    }

    if (step === "date") {
      const dates = getNextDays(14)
      return ctx.editMessageText("Выберите дату:", datesKeyboard(dates))
    }

    return renderSummary(ctx)
  } catch (error) {
    console.error("[CRM] backCapacity error:", error)
    return safeErrorReply(ctx)
  }
}

