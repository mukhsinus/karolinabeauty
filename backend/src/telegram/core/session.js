// src/telegram/core/session.js

import { STEPS } from "./constants.js"

export const initialSession = () => ({
  step: STEPS.IDLE,

  language: null,
  phone: null,
  branchId: null,

  payload: {
    flow: null,
    nav: {
      stack: []
    },

    // booking admin
    booking: {
      type: "today",
      page: 0,
      limit: 5,
      selectedBookingId: null
    },

    // capacity crm
    capacity: {
      branchId: null,
      category: null,
      serviceId: null,
      serviceLevel: null,
      date: null
    }
  }
})

// ================= BASIC =================

export const resetSession = (ctx) => {
  ctx.session = initialSession()
}

export const setStep = (ctx, step) => {
  if (!ctx.session) ctx.session = initialSession()
  ctx.session.step = step
}

// ================= PAYLOAD =================

export const setPayload = (ctx, data = {}) => {
  if (!ctx.session) ctx.session = initialSession()

  ctx.session.payload = {
    ...ctx.session.payload,
    ...data
  }
}

export const clearPayload = (ctx) => {
  if (!ctx.session) ctx.session = initialSession()

  ctx.session.payload = initialSession().payload
}