// src/hooks/useServices.ts

import { useQuery } from "@tanstack/react-query"
import { fetchServices } from "@/lib/api"
import { mapServices } from "@/lib/servicesMapper"

export const useServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const dbServices = await fetchServices()
      return mapServices(dbServices)
    }
  })
}