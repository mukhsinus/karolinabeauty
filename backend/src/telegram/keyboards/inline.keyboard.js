// src/telegram/keyboards/inline.keyboard.js
import { Markup } from "telegraf"
import { formatMoneyLabel } from "../../utils/servicePrice.util.js"

// ================= BRANCHES =================

// универсальная (вход / адрес / часы)
export const branchesInline = (branches, prefix = "branch_select") => {
  const buttons = branches.map(b => [
    Markup.button.callback(
      `📍 ${b.name}`,
      `${prefix}:${b._id}`
    )
  ])

  return Markup.inlineKeyboard(buttons)
}

// ================= CATEGORIES =================

export const categoriesInline = (categories, t) => {
  const buttons = categories.map(c => [
    Markup.button.callback(
      `📂 ${t(`services.${c}`)}`,
      `price_category:${c}`
    )
  ])

  return Markup.inlineKeyboard(buttons)
}

// ================= SERVICES =================

export const servicesInline = (services, t) => {
  const buttons = services.map(s => [
    Markup.button.callback(
      `${t(s.nameKey)} (${formatMoneyLabel(s)})`,
      `price_service:${s._id}`
    )
  ])

  return Markup.inlineKeyboard(buttons)
}

// ================= CONFIRM =================

export const confirmInline = (type) => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("✅ Подтвердить", `confirm:${type}`),
      Markup.button.callback("❌ Отменить", `cancel:${type}`)
    ]
  ])
}