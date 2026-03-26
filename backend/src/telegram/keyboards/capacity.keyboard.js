// backend/src/telegram/keyboards/capacity.keyboard.js

import { Markup } from "telegraf"
import { NAV_CB } from "../core/nav.js"

export const CAPACITY_CB = {
  SERVICE: "crm_capacity:service", // crm_capacity:service:<serviceId>
  LEVEL: "crm_capacity:level", // crm_capacity:level:<level>
  DATE: "crm_capacity:date", // crm_capacity:date:<YYYY-MM-DD>
  SET: "crm_capacity:set", // crm_capacity:set:<n>
  BACK: "crm_capacity:back", // crm_capacity:back:<step>
}

export const branchesKeyboard = (branches) => {
  const rows = branches.map((b) => [
    Markup.button.callback(`🏢 ${b.name}`, `noop:${b._id}`)
  ])
  rows.push([Markup.button.callback("↩️ Назад", NAV_CB.BACK)])
  return Markup.inlineKeyboard(rows)
}

export const servicesKeyboard = (services) => {
  const rows = services.slice(0, 30).map((s) => [
    Markup.button.callback(
      `${s.category ? `${s.category} • ` : ""}${s.nameKey}`.slice(0, 60),
      `${CAPACITY_CB.SERVICE}:${s._id}`
    )
  ])

  rows.push([Markup.button.callback("↩️ Назад", `${CAPACITY_CB.BACK}:service`)])
  rows.push([Markup.button.callback("↩️ Назад", NAV_CB.BACK)])
  return Markup.inlineKeyboard(rows)
}

export const levelsKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("Мастер", `${CAPACITY_CB.LEVEL}:master`)],
    [Markup.button.callback("Топ", `${CAPACITY_CB.LEVEL}:top`)],
    [Markup.button.callback("Премиум", `${CAPACITY_CB.LEVEL}:premium`)],
    [Markup.button.callback("↩️ Назад", `${CAPACITY_CB.BACK}:service`)],
    [Markup.button.callback("↩️ Назад", NAV_CB.BACK)],
  ])
}

export const datesKeyboard = (dates) => {
  const rows = []
  const perRow = 7

  for (let i = 0; i < dates.length; i += perRow) {
    const chunk = dates.slice(i, i + perRow)
    rows.push(
      chunk.map((d) => Markup.button.callback(d.slice(8, 10), `${CAPACITY_CB.DATE}:${d}`))
    )
  }

  rows.push([Markup.button.callback("↩️ Назад", `${CAPACITY_CB.BACK}:level`)])
  rows.push([Markup.button.callback("↩️ Назад", NAV_CB.BACK)])
  return Markup.inlineKeyboard(rows)
}

export const capacityKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("1", `${CAPACITY_CB.SET}:1`),
      Markup.button.callback("2", `${CAPACITY_CB.SET}:2`),
      Markup.button.callback("3", `${CAPACITY_CB.SET}:3`),
      Markup.button.callback("4", `${CAPACITY_CB.SET}:4`),
      Markup.button.callback("5", `${CAPACITY_CB.SET}:5`),
    ],
    [Markup.button.callback("↩️ Назад", `${CAPACITY_CB.BACK}:date`)],
    [Markup.button.callback("↩️ Назад", NAV_CB.BACK)],
  ])
}

