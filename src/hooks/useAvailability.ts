// src/hooks/useAvailability.ts
import { useQuery } from "@tanstack/react-query"
import { fetchAvailability } from "@/lib/api"

export const useAvailability = (branchId?: string, date?: string) => {
  return useQuery({
    queryKey: ["availability", branchId, date],
    queryFn: () => fetchAvailability(branchId!, date!),
    enabled: !!branchId && !!date
  })
}