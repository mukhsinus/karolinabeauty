// backend/src/utils/servicePrice.util.js

/**
 * Resolve a single price row for the requested tier (case-insensitive).
 */
export function findPriceForLevel(service, serviceLevel) {
  if (!service || !Array.isArray(service.prices)) return null
  const want = String(serviceLevel || "").toLowerCase()
  return (
    service.prices.find((p) => String(p.level).toLowerCase() === want) ?? null
  )
}

/**
 * Minimum numeric price from the service's price tiers (for compact labels).
 */
export function getMinPriceFromService(service) {
  if (!service?.prices?.length) return null
  const nums = service.prices.map((p) => Number(p.price)).filter(Number.isFinite)
  if (!nums.length) return null
  return Math.min(...nums)
}

/**
 * Heuristic listing currency when `currency` is not stored on the document.
 * Hair work is priced in USD in seed data (values below typical UZS magnitudes).
 */
export function inferListingCurrency(service) {
  if (!service?.prices?.length) return "UZS"
  const maxP = Math.max(
    ...service.prices.map((p) => Number(p.price)).filter(Number.isFinite)
  )
  if (!Number.isFinite(maxP)) return "UZS"
  if (String(service.category || "") === "hair" && maxP < 10000) return "USD"
  return "UZS"
}

/**
 * Telegram / admin list lines: "123 000 сум" or "100 USD".
 */
export function formatMoneyLabel(service) {
  const n = getMinPriceFromService(service)
  if (n == null || Number.isNaN(n)) return "—"
  const cur = inferListingCurrency(service)
  if (cur === "USD") return `${n} USD`
  return `${n} сум`
}
