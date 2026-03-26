// backend/src/telegram/keyboards/blocking.keyboard.js

import { Markup } from "telegraf"

export const BLOCKING_CB = {
  START: "crm_blocking:start",
  BRANCH: "crm_blocking:branch", // crm_blocking:branch:<branchId>
  DATE: "crm_blocking:date", // crm_blocking:date:<YYYY-MM-DD>
  BLOCK_DAY: "crm_blocking:block_day", // crm_blocking:block_day
  BLOCK_TIME_PICK: "crm_blocking:block_time_pick", // crm_blocking:block_time_pick
  TIME: "crm_blocking:time", // crm_blocking:time:<HH:MM>
  UNBLOCK_DAY: "crm_blocking:unblock_day", // crm_blocking:unblock_day
  UNBLOCK_TIME: "crm_blocking:unblock_time", // crm_blocking:unblock_time:<HH:MM>
  BACK: "crm_blocking:back", // crm_blocking:back:<step>
}

export const branchesKeyboard = (branches) => {
  const rows = branches.map((b) => [
    Markup.button.callback(`🏢 ${b.name}`, `${BLOCKING_CB.BRANCH}:${b._id}`)
  ])

  rows.push([Markup.button.callback("⬅️ Назад", "crm_back:admin")])
  return Markup.inlineKeyboard(rows)
}

export const datesKeyboard = (dates) => {
  const rows = []
  const perRow = 7

  for (let i = 0; i < dates.length; i += perRow) {
    const chunk = dates.slice(i, i + perRow)
    rows.push(
      chunk.map((d) =>
        Markup.button.callback(d.slice(8, 10), `${BLOCKING_CB.DATE}:${d}`)
      )
    )
  }

  rows.push([Markup.button.callback("⬅️ Назад", "crm_back:blocking_branch")])
  return Markup.inlineKeyboard(rows)
}

export const blockingActionsKeyboard = ({ isDayBlocked, blockedTimes }) => {
  const rows = []

  rows.push([
    Markup.button.callback("⛔ Заблокировать день", BLOCKING_CB.BLOCK_DAY),
    Markup.button.callback("🕒 Заблокировать время", BLOCKING_CB.BLOCK_TIME_PICK),
  ])

  if (isDayBlocked) {
    rows.push([Markup.button.callback("✅ Разблокировать день", BLOCKING_CB.UNBLOCK_DAY)])
  }

  if (!isDayBlocked && blockedTimes?.length) {
    for (const t of blockedTimes.slice(0, 24)) {
      rows.push([
        Markup.button.callback(`✅ Разблокировать ${t}`, `${BLOCKING_CB.UNBLOCK_TIME}:${t}`)
      ])
    }
  }

  rows.push([
    Markup.button.callback("📅 Выбрать дату", `${BLOCKING_CB.BACK}:date`),
    Markup.button.callback("🏢 Сменить филиал", `${BLOCKING_CB.BACK}:branch`),
  ])

  rows.push([Markup.button.callback("⬅️ Назад", "crm_back:blocking_date")])
  return Markup.inlineKeyboard(rows)
}

export const timesKeyboard = (times) => {
  const rows = []
  const perRow = 4

  for (let i = 0; i < times.length; i += perRow) {
    const chunk = times.slice(i, i + perRow)
    rows.push(chunk.map((t) => Markup.button.callback(t, `${BLOCKING_CB.TIME}:${t}`)))
  }

  rows.push([Markup.button.callback("⬅️ Назад", "crm_back:blocking_actions")])
  return Markup.inlineKeyboard(rows)
}

