// backend/src/telegram/flows/capacity.flow.js

import { setPayload } from "../core/session.js"
import { getBranches } from "../services/api.service.js"
import Service from "../../models/Service.js"

import { getSlotCapacity, upsertSlotCapacity } from "../../services/capacity.service.js"

import {
  branchesKeyboard,
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

  const capacity = await getSlotCapacity({ branchId, serviceId, serviceLevel, date })
  await ctx.editMessageText(
    `Мастера / Capacity\n\n🏢 ${branchId}\n💇 ${serviceId}\n⭐ ${serviceLevel}\n📅 ${date}\n\nТекущая capacity: ${capacity}\n\nВыберите новую (1–5):`,
    capacityKeyboard()
  )
}

export const startCapacityFlow = async (ctx) => {
  try {
    setPayload(ctx, {
      capacity: {
        branchId: null,
        serviceId: null,
        serviceLevel: null,
        date: null
      }
    })

    const branches = await getBranches()
    if (!branches?.length) return ctx.reply("⚠️ Нет доступных филиалов")
    return ctx.reply("Выберите филиал:", branchesKeyboard(branches))
  } catch (error) {
    console.error("[CRM] startCapacityFlow error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectCapacityBranch = async (ctx, { branchId }) => {
  try {
    if (!isValidObjectId(branchId)) return safeErrorReply(ctx)

    setPayload(ctx, {
      capacity: {
        branchId,
        serviceId: null,
        serviceLevel: null,
        date: null
      }
    })

    const services = await Service.find({ isActive: true })
      .select("_id nameKey category")
      .sort({ category: 1, nameKey: 1 })
      .lean()

    if (!services?.length) {
      return ctx.editMessageText("⚠️ Нет активных услуг")
    }

    return ctx.editMessageText("Выберите услугу:", servicesKeyboard(services))
  } catch (error) {
    console.error("[CRM] selectCapacityBranch error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectCapacityService = async (ctx, { serviceId }) => {
  try {
    if (!isValidObjectId(serviceId)) return safeErrorReply(ctx)

    setPayload(ctx, {
      capacity: {
        ...ctx.session.payload.capacity,
        serviceId,
        serviceLevel: null,
        date: null
      }
    })

    return ctx.editMessageText("Выберите уровень:", levelsKeyboard())
  } catch (error) {
    console.error("[CRM] selectCapacityService error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectCapacityLevel = async (ctx, { serviceLevel }) => {
  try {
    if (!["master", "top", "premium"].includes(serviceLevel)) return safeErrorReply(ctx)

    setPayload(ctx, {
      capacity: {
        ...ctx.session.payload.capacity,
        serviceLevel,
        date: null
      }
    })

    const dates = getNextDays(14)
    return ctx.editMessageText("Выберите дату:", datesKeyboard(dates))
  } catch (error) {
    console.error("[CRM] selectCapacityLevel error:", error)
    return safeErrorReply(ctx)
  }
}

export const selectCapacityDate = async (ctx, { date }) => {
  try {
    if (!isDateISO(date)) return safeErrorReply(ctx)

    setPayload(ctx, {
      capacity: {
        ...ctx.session.payload.capacity,
        date
      }
    })

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

    return renderSummary(ctx)
  } catch (error) {
    console.error("[CRM] setCapacityValue error:", error)
    return safeErrorReply(ctx)
  }
}

export const backCapacity = async (ctx, { step }) => {
  try {
    const p = ctx.session?.payload?.capacity
    if (!p) return safeErrorReply(ctx)

    if (step === "branch") return startCapacityFlow(ctx)

    if (step === "service") {
      const branchId = p.branchId
      if (!isValidObjectId(branchId)) return safeErrorReply(ctx)

      const services = await Service.find({ isActive: true })
        .select("_id nameKey category")
        .sort({ category: 1, nameKey: 1 })
        .lean()

      return ctx.editMessageText("Выберите услугу:", servicesKeyboard(services))
    }

    if (step === "level") {
      return ctx.editMessageText("Выберите уровень:", levelsKeyboard())
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

