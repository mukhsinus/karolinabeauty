// src/telegram/core/constants.js

export const STEPS = {
  IDLE: "IDLE",

  // onboarding
  LANGUAGE: "LANGUAGE",
  PHONE: "PHONE",
  BRANCH: "BRANCH",

  // main
  ADMIN_PANEL: "ADMIN_PANEL",

  // ===== PRICE FLOW =====
  PRICE_CATEGORY: "PRICE_CATEGORY",
  PRICE_SERVICE: "PRICE_SERVICE",
  WAITING_PRICE: "WAITING_PRICE",
  CONFIRM_PRICE: "CONFIRM_PRICE",

  // ===== ADDRESS FLOW =====
  ADDRESS_BRANCH: "ADDRESS_BRANCH",
  WAITING_ADDRESS: "WAITING_ADDRESS",
  CONFIRM_ADDRESS: "CONFIRM_ADDRESS",

  // ===== HOURS FLOW =====
  HOURS_BRANCH: "HOURS_BRANCH",
  WAITING_HOURS: "WAITING_HOURS",
  CONFIRM_HOURS: "CONFIRM_HOURS"
}

export const BUTTONS = {
  BOOKINGS: "📅 Сегодняшние записи",
  PRICE: "💰 Изменить цену",
  HOURS: "🕐 Изменить часы работы",
  ADDRESS: "📍 Изменить адрес филиала"
}