import { afterEach, describe, expect, it } from "vitest"
import {
  bookingFingerprint,
  hasCompletedBooking,
  isDuplicateBookingError,
  normalizeBookingPhone,
  rememberCompletedBooking,
  DUPLICATE_BOOKING_CODE,
  DUPLICATE_BOOKING_MESSAGE
} from "./bookingGuard"

describe("bookingGuard", () => {
  afterEach(() => {
    sessionStorage.clear()
  })

  it("normalizes phone digits the same way as the backend", () => {
    expect(normalizeBookingPhone("+998 90 123-45-67")).toBe("+998901234567")
  })

  it("treats the same slot as a duplicate and a different service as new", () => {
    const base = {
      branchId: "b1",
      serviceId: "svcA",
      serviceLevel: "master",
      date: "2026-08-26",
      time: "11:00",
      phone: "+998 90 111-22-33"
    }

    const a = bookingFingerprint(base)
    const aAgain = bookingFingerprint({ ...base, phone: "+998901112233" })
    const serviceB = bookingFingerprint({ ...base, serviceId: "svcB" })

    rememberCompletedBooking(a)

    expect(aAgain).toBe(a)
    expect(hasCompletedBooking(aAgain)).toBe(true)
    expect(hasCompletedBooking(serviceB)).toBe(false)
  })

  it("detects duplicate API errors", () => {
    expect(
      isDuplicateBookingError({
        code: DUPLICATE_BOOKING_CODE,
        message: DUPLICATE_BOOKING_MESSAGE
      })
    ).toBe(true)
    expect(isDuplicateBookingError(new Error("Time slot is full"))).toBe(false)
  })
})
