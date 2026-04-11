/** Matches backend branchPremium.util.js (slug + seed name fallback). */

const YUNUSABAD_SLUG = "yunusabad"
const CHILANZAR_SLUG = "chilanzar"
const SEED_NAME_YUNUSABAD = "Юнусабад"
const SEED_NAME_CHILANZAR = "Чиланзар"

export function isPremiumLevelSelectableForBranch(
  branch: { slug?: string; name?: string } | null | undefined,
  level: string
): boolean {
  if (String(level).toLowerCase() !== "premium") return true

  const slug = String(branch?.slug || "").toLowerCase()
  if (slug === YUNUSABAD_SLUG) return true
  if (slug === CHILANZAR_SLUG) return false

  const name = String(branch?.name || "").trim()
  if (name === SEED_NAME_YUNUSABAD) return true
  if (name === SEED_NAME_CHILANZAR) return false

  return false
}
