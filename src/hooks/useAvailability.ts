// src/hooks/useAvailability.ts

import { useQuery } from "@tanstack/react-query"
import {
  fetchAvailability,
  type AvailabilityPayload,
} from "@/lib/api"

export const useAvailability = (
  branchId?: string | null,
  serviceId?: string,
  serviceLevel?: string,
  date?: string
) => {
  return useQuery<AvailabilityPayload>({
    queryKey: [
      "availability",
      branchId,
      serviceId,
      serviceLevel,
      date,
    ],

    queryFn: () =>
      fetchAvailability(
        branchId!,
        serviceId!,
        serviceLevel!,
        date!
      ),

    enabled:
      !!branchId &&
      !!serviceId &&
      !!serviceLevel &&
      !!date,
  })
}
