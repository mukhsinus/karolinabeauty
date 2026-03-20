// src/lib/servicesMapper.ts
import { serviceCategories } from "@/data/services"

interface DbService {
  _id: string
  nameKey: string
  category?: string
  duration: number
  // New backend shape
  prices?: Array<{
    level: "master" | "top" | "premium" | "promo"
    price: number
  }>
  // Legacy backend shape (kept for compatibility)
  price?: number
  isFrom?: boolean
  isPromo?: boolean
}

export const mapServices = (dbServices: DbService[]) => {

  const map = new Map(
    dbServices.map(s => [s.nameKey, s])
  )

  return serviceCategories.map(category => ({

    ...category,

    groups: category.groups.map(group => ({

      ...group,

      services: group.services.map(service => {

        const db = map.get(service.nameKey)

        const dbPrices =
          Array.isArray(db?.prices) && db?.prices.length > 0
            ? db.prices
            : typeof db?.price === "number"
              ? [{ level: "master" as const, price: db.price }]
              : null

        const mappedPrices =
          dbPrices ??
          [
            {
              level: "master" as const,
              price: service.price
            }
          ]

        const masterPrice =
          mappedPrices.find((p) => p.level === "master")?.price ??
          mappedPrices[0]?.price ??
          service.price

        // ❌ если нет в БД — fallback
        if (!db) {
          return {
            ...service,

            id: service.id,              // UI id (из фронта)
            mongoId: null,              // ❗ нет в базе

            category: category.id,
            prices: mappedPrices,
            price: masterPrice,
            isPromo: service.nameKey.includes("lamination")
          }
        }

        // ✅ нормальный случай (есть в БД)
        return {
          ...service,
          id: db._id || service.id, // fallback to front id if db._id is missing
          mongoId: db._id,
          _id: db._id,
          category: db.category || category.id,
          prices: mappedPrices,
          price: masterPrice,
          duration: db.duration ?? service.duration,
          isFrom: db.isFrom,
          isPromo:
            db.isPromo === true ||
            service.nameKey.includes("lamination")
        }

      })

    }))

  }))
}