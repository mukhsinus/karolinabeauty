// src/lib/servicesMapper.ts
import { serviceCategories } from "@/data/services"

interface DbService {
  _id: string
  nameKey: string
  price: number
  duration: number
  isFrom?: boolean
  isPromo?: boolean // 🔥 добавили
}

export const mapServices = (
  dbServices: DbService[]
) => {

  const map = new Map(
    dbServices.map(s => [s.nameKey, s])
  )

  return serviceCategories.map(category => ({

    ...category,

    groups: category.groups.map(group => ({

      ...group,

      services: group.services.map(service => {

        const db = map.get(service.nameKey)

        // если нет в БД — возвращаем фронтовый, но с fallback promo
        if (!db) {
          return {
            ...service,
            isPromo: service.nameKey.includes("lamination") // 🔥 fallback
          }
        }

        return {
          ...service,
          _id: db._id,
          price: db.price,
          duration: db.duration,
          isFrom: db.isFrom,

          // 🔥 ГЛАВНАЯ ЛОГИКА АКЦИИ
          isPromo:
            db.isPromo === true ||
            service.nameKey.includes("lamination")
        }

      })

    }))

  }))

}