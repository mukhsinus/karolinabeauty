// src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10, // 10 сек данные считаются свежими
      refetchInterval: 5000, // автообновление каждые 5 сек
      refetchOnWindowFocus: true,
      retry: 2
    }
  }
})