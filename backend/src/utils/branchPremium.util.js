// backend/src/utils/branchPremium.util.js
/** Branch slug set in DB (see seedBranches). Premium tier is bookable only at Yunusabad. */

const YUNUSABAD_SLUG = "yunusabad"

export function isPremiumLevelAllowedForBranch(branch, serviceLevel) {
  if (String(serviceLevel || "").toLowerCase() !== "premium") return true
  const slug = String(branch?.slug || "").toLowerCase()
  return slug === YUNUSABAD_SLUG
}

export function assertPremiumAllowedForBranch(branch, serviceLevel) {
  if (isPremiumLevelAllowedForBranch(branch, serviceLevel)) return
  throw new Error("Premium master level is not available at this branch")
}
