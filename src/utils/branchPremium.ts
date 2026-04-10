/** Matches backend Branch.slug (seed: chilanzar, yunusabad). */

const YUNUSABAD_SLUG = "yunusabad"

export function isPremiumLevelSelectableForBranch(
  branch: { slug?: string } | null | undefined,
  level: string
): boolean {
  if (String(level).toLowerCase() !== "premium") return true
  return String(branch?.slug || "").toLowerCase() === YUNUSABAD_SLUG
}
