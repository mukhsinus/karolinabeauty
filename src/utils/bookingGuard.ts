// Prevents the same completed booking from being sent again
// in this browser tab. A different service/slot is a new booking.

export const DUPLICATE_BOOKING_CODE = "DUPLICATE_BOOKING"
export const DUPLICATE_BOOKING_MESSAGE = "Duplicate client booking"

const COMPLETED_KEY = "karolina:completedBookings"
const JUST_COMPLETED_KEY = "karolina:bookingJustCompleted"
const MAX_STORED = 20

export type BookingFingerprintInput = {
  branchId: string
  serviceId: string
  serviceLevel: string
  date: string
  time: string
  phone: string
}

export function normalizeBookingPhone(phone: string): string {
  return String(phone || "").replace(/[^\d+]/g, "")
}

export function bookingFingerprint(input: BookingFingerprintInput): string {
  return [
    String(input.branchId || ""),
    String(input.serviceId || ""),
    String(input.serviceLevel || "").toLowerCase(),
    String(input.date || ""),
    String(input.time || ""),
    normalizeBookingPhone(input.phone)
  ].join("|")
}

function readList(): string[] {
  try {
    const raw = sessionStorage.getItem(COMPLETED_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((x) => typeof x === "string")
      : []
  } catch {
    return []
  }
}

function writeList(list: string[]) {
  try {
    sessionStorage.setItem(COMPLETED_KEY, JSON.stringify(list.slice(-MAX_STORED)))
  } catch {
    // private mode / quota — ignore
  }
}

export function hasCompletedBooking(fingerprint: string): boolean {
  if (!fingerprint) return false
  return readList().includes(fingerprint)
}

export function rememberCompletedBooking(fingerprint: string) {
  if (!fingerprint) return
  const list = readList()
  if (list.includes(fingerprint)) return
  list.push(fingerprint)
  writeList(list)
}

export function hasJustCompletedBooking(): boolean {
  try {
    return sessionStorage.getItem(JUST_COMPLETED_KEY) === "1"
  } catch {
    return false
  }
}

export function setJustCompletedBooking() {
  try {
    sessionStorage.setItem(JUST_COMPLETED_KEY, "1")
  } catch {
    // ignore
  }
}

export function clearJustCompletedBooking() {
  try {
    sessionStorage.removeItem(JUST_COMPLETED_KEY)
  } catch {
    // ignore
  }
}

export function isDuplicateBookingError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false
  const err = error as { code?: string; message?: string }
  return (
    err.code === DUPLICATE_BOOKING_CODE ||
    err.message === DUPLICATE_BOOKING_MESSAGE
  )
}
