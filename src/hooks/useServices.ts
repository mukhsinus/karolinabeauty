// src/hooks/useServices.ts
import { useEffect, useState } from "react"
import { fetchServices } from "@/lib/api"
import { mapServices } from "@/lib/servicesMapper"

export const useServices = () => {

  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const load = async () => {

      try {

        const dbServices = await fetchServices()

        const mapped = mapServices(dbServices)

        setServices(mapped)

      } catch (e) {

        console.error("services load error", e)

      } finally {

        setLoading(false)

      }

    }

    load()

  }, [])

  return { services, loading }

}