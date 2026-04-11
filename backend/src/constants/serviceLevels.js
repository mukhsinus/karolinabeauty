// backend/src/constants/serviceLevels.js
/** Matches Service model price tier enum (master / top / premium / promo). */

export const SERVICE_PRICE_LEVELS = Object.freeze([
  "master",
  "top",
  "premium",
  "promo",
])

export function isKnownPriceLevel(level) {
  const s = String(level || "").toLowerCase()
  return SERVICE_PRICE_LEVELS.includes(s)
}
