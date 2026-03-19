// src/lib/servicesMapper.ts
import { serviceCategories } from "@/data/services"

interface DbService {
  _id: string
  nameKey: string
  price: number
  duration: number
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

        // ❌ если нет в БД — fallback
        if (!db) {
          return {
            ...service,

            id: service.id,              // UI id (из фронта)
            mongoId: null,              // ❗ нет в базе

            isPromo: service.nameKey.includes("lamination")
          }
        }

        // ✅ нормальный случай (есть в БД)
        return {
          ...service,
          id: db._id || service.id, // fallback to front id if db._id is missing
          mongoId: db._id,
          _id: db._id,
          price: db.price,
          duration: db.duration,
          isFrom: db.isFrom,
          isPromo:
            db.isPromo === true ||
            service.nameKey.includes("lamination")
        }

      })

    }))

  }))
}