// src/lib/servicesMapper.ts
import { serviceCategories } from "@/data/services"

interface DbService {
  _id: string
  nameKey: string
  price: number
  duration: number
  isFrom?: boolean
}

/*
Соединяет MongoDB services + структуру services.ts
*/

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
        if (!db) return service
        return {
          ...service,
          _id: db._id, // Add MongoDB ObjectId
          price: db.price,
          duration: db.duration,
          isFrom: db.isFrom
        }
      })

    }))

  }))
}