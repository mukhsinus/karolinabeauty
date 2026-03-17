// src/hooks/useBranches.ts

import { useQuery } from "@tanstack/react-query"

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api"

const fetchBranches = async () => {
  const res = await fetch(`${API_URL}/branches`)
  if (!res.ok) throw new Error("Failed to load branches")
  return res.json()
}

export const useBranches = () => {
  return useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches
  })
}