// backend/src/telegram/keyboards/booking.keyboard.js

import { Markup } from "telegraf"

export const BOOKING_CB = {
  LIST: "crm_booking:list", // crm_booking:list:<type>:<page>
  OPEN: "crm_booking:open", // crm_booking:open:<id>:<type>:<page>
  RESCHEDULE_START: "crm_booking:reschedule_start", // crm_booking:reschedule_start:<id>:<type>:<page>
  RESCHEDULE_DATE: "crm_booking:reschedule_date", // crm_booking:reschedule_date:<YYYY-MM-DD>
  RESCHEDULE_TIME: "crm_booking:reschedule_time", // crm_booking:reschedule_time:<HH:MM>
  RESCHEDULE_CONFIRM: "crm_booking:reschedule_confirm", // crm_booking:reschedule_confirm
  RESCHEDULE_DO: "crm_booking:reschedule_do", // crm_booking:reschedule_do
  RESCHEDULE_BACK: "crm_booking:reschedule_back", // crm_booking:reschedule_back:<step>
  CANCEL_CONFIRM: "crm_booking:cancel_confirm", // crm_booking:cancel_confirm:<id>:<type>:<page>
  COMPLETE_CONFIRM: "crm_booking:complete_confirm", // crm_booking:complete_confirm:<id>:<type>:<page>
  CANCEL_DO: "crm_booking:cancel_do", // crm_booking:cancel_do:<id>:<type>:<page>
  COMPLETE_DO: "crm_booking:complete_do", // crm_booking:complete_do:<id>:<type>:<page>
}

export const bookingPeriodKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📅 Сегодня", `${BOOKING_CB.LIST}:today:0`)],
    [Markup.button.callback("📅 7 дней", `${BOOKING_CB.LIST}:next7:0`)],
  ])
}

export const bookingListKeyboard = ({ type, page, hasPrev, hasNext, items }) => {
  const rows = []

  for (const b of items) {
    const title = `📅 ${b.date} 🕒 ${b.time} • ${b.name}`
    rows.push([
      Markup.button.callback(
        title.slice(0, 60),
        `${BOOKING_CB.OPEN}:${b._id}:${type}:${page}`
      ),
    ])
  }

  const nav = []
  if (hasPrev) nav.push(Markup.button.callback("⬅️ Назад", `${BOOKING_CB.LIST}:${type}:${page - 1}`))
  if (hasNext) nav.push(Markup.button.callback("➡️ Вперёд", `${BOOKING_CB.LIST}:${type}:${page + 1}`))
  if (nav.length) rows.push(nav)

  return Markup.inlineKeyboard(rows)
}

export const bookingCardKeyboard = ({ bookingId, type, page }) => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        "❌ Отменить",
        `${BOOKING_CB.CANCEL_CONFIRM}:${bookingId}:${type}:${page}`
      ),
      Markup.button.callback(
        "✅ Завершить",
        `${BOOKING_CB.COMPLETE_CONFIRM}:${bookingId}:${type}:${page}`
      ),
    ],
    [
      Markup.button.callback(
        "🔁 Перенести",
        `${BOOKING_CB.RESCHEDULE_START}:${bookingId}:${type}:${page}`
      ),
    ],
    [Markup.button.callback("⬅️ К списку", `${BOOKING_CB.LIST}:${type}:${page}`)],
  ])
}

export const bookingConfirmKeyboard = ({ kind, bookingId, type, page }) => {
  const doCb =
    kind === "cancel"
      ? `${BOOKING_CB.CANCEL_DO}:${bookingId}:${type}:${page}`
      : `${BOOKING_CB.COMPLETE_DO}:${bookingId}:${type}:${page}`

  return Markup.inlineKeyboard([
    [
      Markup.button.callback("✅ Подтвердить", doCb),
      Markup.button.callback("↩️ Назад", `${BOOKING_CB.OPEN}:${bookingId}:${type}:${page}`),
    ],
    [Markup.button.callback("⬅️ К списку", `${BOOKING_CB.LIST}:${type}:${page}`)],
  ])
}

export const rescheduleDatesKeyboard = ({ dates }) => {
  const rows = []
  const perRow = 7

  for (let i = 0; i < dates.length; i += perRow) {
    const chunk = dates.slice(i, i + perRow)
    rows.push(
      chunk.map((d) => Markup.button.callback(d.slice(8, 10), `${BOOKING_CB.RESCHEDULE_DATE}:${d}`))
    )
  }

  rows.push([
    Markup.button.callback("↩️ Назад", `${BOOKING_CB.RESCHEDULE_BACK}:card`),
  ])

  return Markup.inlineKeyboard(rows)
}

export const rescheduleTimesKeyboard = ({ times }) => {
  const rows = []
  const perRow = 4

  for (let i = 0; i < times.length; i += perRow) {
    const chunk = times.slice(i, i + perRow)
    rows.push(
      chunk.map((t) => Markup.button.callback(t, `${BOOKING_CB.RESCHEDULE_TIME}:${t}`))
    )
  }

  rows.push([
    Markup.button.callback("↩️ Назад", `${BOOKING_CB.RESCHEDULE_BACK}:dates`),
  ])

  return Markup.inlineKeyboard(rows)
}

export const rescheduleConfirmKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("✅ Подтвердить", BOOKING_CB.RESCHEDULE_DO),
      Markup.button.callback("↩️ Назад", `${BOOKING_CB.RESCHEDULE_BACK}:times`),
    ],
  ])
}

