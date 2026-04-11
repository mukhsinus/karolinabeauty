// backend/src/utils/branchPremium.util.js
/** Premium tier only at Yunusabad. Prefer Branch.slug; fall back to seed Branch.name if slug missing. */

const YUNUSABAD_SLUG = "yunusabad"
const CHILANZAR_SLUG = "chilanzar"
/** Must match seedBranches.js `name` for Yunusabad / Chilanzar (legacy DB rows without slug). */
const SEED_NAME_YUNUSABAD = "Юнусабад"
const SEED_NAME_CHILANZAR = "Чиланзар"

export function isPremiumLevelAllowedForBranch(branch, serviceLevel) {
  if (String(serviceLevel || "").toLowerCase() !== "premium") return true

  const slug = String(branch?.slug || "").toLowerCase()
  if (slug === YUNUSABAD_SLUG) return true
  if (slug === CHILANZAR_SLUG) return false

  const name = String(branch?.name || "").trim()
  if (name === SEED_NAME_YUNUSABAD) return true
  if (name === SEED_NAME_CHILANZAR) return false

  return false
}

export function assertPremiumAllowedForBranch(branch, serviceLevel) {
  if (isPremiumLevelAllowedForBranch(branch, serviceLevel)) return
  throw new Error("Premium master level is not available at this branch")
}
