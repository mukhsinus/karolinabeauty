// src/lib/servicesMapper.ts
import { serviceCategories } from "@/data/services"
import type { ServiceItem } from "@/data/services"

/** Same as backend EXCLUDED_PUBLIC_NAME_KEYS — hide duplicate even if API/cache is stale. */
const EXCLUDED_FROM_CATALOG_NAME_KEYS = new Set(["services.classic"])

interface DbService {
  _id: string
  nameKey: string
  category?: string
  duration?: number
  prices?: Array<{
    level: "master" | "top" | "premium" | "promo" | string
    price: number
  }>
  price?: number
  isFrom?: boolean
  isPromo?: boolean
  currency?: string
}

function mapDbServiceToItem(db: DbService): ServiceItem {
  const id = String(db._id)
  const prices =
    Array.isArray(db.prices) && db.prices.length > 0
      ? db.prices.map((p) => ({
          level: String(p.level),
          price: Number(p.price)
        }))
      : typeof db.price === "number"
        ? [{ level: "master", price: db.price }]
        : []

  const masterPrice =
    prices.find((p) => p.level === "master")?.price ??
    prices[0]?.price ??
    0

  return {
    id,
    mongoId: id,
    _id: id,
    nameKey: db.nameKey,
    category: db.category,
    prices,
    price: masterPrice,
    duration: db.duration ?? 60,
    isFrom: db.isFrom,
    isPromo: db.isPromo === true,
    currency: db.currency
  }
}

export const mapServices = (dbServices: DbService[]) => {
  const byCategory = new Map<string, DbService[]>()
  for (const s of dbServices) {
    if (EXCLUDED_FROM_CATALOG_NAME_KEYS.has(String(s?.nameKey ?? ""))) continue
    const cat = s.category || ""
    if (!cat) continue
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat)!.push(s)
  }

  for (const [, list] of byCategory) {
    list.sort((a, b) => a.nameKey.localeCompare(b.nameKey))
  }

  return serviceCategories.map((category) => {
    const inCat = byCategory.get(category.id) || []
    const mapped: ServiceItem[] = inCat.map(mapDbServiceToItem)

    return {
      ...category,
      groups: category.groups.map((group, idx) =>
        idx === 0 ? { ...group, services: mapped } : { ...group, services: [] }
      )
    }
  })
}
