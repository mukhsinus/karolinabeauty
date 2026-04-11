// backend/src/telegram/keyboards/capacity.keyboard.js

import { Markup } from "telegraf"
import { translateCategory, translateService } from "../utils/serviceI18n.js"
import { isPremiumLevelAllowedForBranch } from "../../utils/branchPremium.util.js"

export const CAPACITY_CB = {
  CATEGORY: "crm_capacity:category", // crm_capacity:category:<category>
  SERVICE: "crm_capacity:service", // crm_capacity:service:<serviceId>
  LEVEL: "crm_capacity:level", // crm_capacity:level:<level>
  DATE: "crm_capacity:date", // crm_capacity:date:<YYYY-MM-DD>
  SET: "crm_capacity:set", // crm_capacity:set:<n>
  BACK: "crm_capacity:back", // crm_capacity:back:<step>
}

export const categoriesKeyboard = (categories, lang = "ru") => {
  const rows = (categories || []).slice(0, 30).map((c) => [
    Markup.button.callback(
      translateCategory(c, lang).slice(0, 60),
      `${CAPACITY_CB.CATEGORY}:${c}`
    )
  ])

  rows.push([Markup.button.callback("⬅️ Назад", "crm_back:admin")])
  return Markup.inlineKeyboard(rows)
}

export const servicesKeyboard = (services, lang = "ru") => {
  const rows = services.slice(0, 30).map((s) => [
    Markup.button.callback(
      (() => {
        const result = translateService(s.nameKey, lang)
        console.log({ lang, key: s.nameKey, result })
        return result.slice(0, 60)
      })(),
      `${CAPACITY_CB.SERVICE}:${s._id}`
    )
  ])

  rows.push([Markup.button.callback("⬅️ Назад", "crm_back:capacity_categories")])
  return Markup.inlineKeyboard(rows)
}

/** branch: lean { slug, name } from DB — premium only at Yunusabad */
export const levelsKeyboard = (branch) => {
  const rows = [
    [Markup.button.callback("Мастер", `${CAPACITY_CB.LEVEL}:master`)],
    [Markup.button.callback("Топ", `${CAPACITY_CB.LEVEL}:top`)]
  ]
  if (isPremiumLevelAllowedForBranch(branch, "premium")) {
    rows.push([Markup.button.callback("Премиум", `${CAPACITY_CB.LEVEL}:premium`)])
  }
  rows.push([Markup.button.callback("⬅️ Назад", "crm_back:capacity_services")])
  return Markup.inlineKeyboard(rows)
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

  rows.push([Markup.button.callback("⬅️ Назад", "crm_back:capacity_levels")])
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
    [Markup.button.callback("⬅️ Назад", "crm_back:capacity_dates")],
  ])
}

