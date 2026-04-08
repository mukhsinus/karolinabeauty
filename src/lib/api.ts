// src/lib/api.ts

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api"

/*
GET services
*/

export const fetchServices = async () => {
  const res = await fetch(`${API_URL}/services`)
  if (!res.ok) {
    throw new Error("Failed to load services")
  }
  return res.json()
}

/*
GET branches
*/

export const fetchBranches = async () => {
  const res = await fetch(`${API_URL}/branches`)
  if (!res.ok) {
    throw new Error("Failed to load branches")
  }
  return res.json()
}

export type AvailabilitySlot = {
  time: string
  available: boolean
  isVip: boolean
}

export type AvailabilityPayload =
  | { type: "manual" }
  | { type: "slots"; slots: AvailabilitySlot[] }

/*
GET availability — server-driven slots only (no client-side grid).
*/

export const fetchAvailability = async (
  branchId: string,
  serviceId: string,
  serviceLevel: string,
  date: string
): Promise<AvailabilityPayload> => {
  const params = new URLSearchParams({
    branchId,
    serviceId,
    serviceLevel,
    date,
  })

  const res = await fetch(
    `${API_URL}/availability?${params.toString()}`
  )

  if (!res.ok) {
    throw new Error("Failed to load availability")
  }

  const json = await res.json()
  const data = json?.data

  if (data?.type === "manual") {
    return { type: "manual" }
  }

  if (data?.type === "slots" && Array.isArray(data.slots)) {
    return { type: "slots", slots: data.slots }
  }

  return { type: "slots", slots: [] }
}

/*
POST booking
*/

export const createBooking = async (data: {
  branchId: string
  serviceId: string
  serviceName: string
  serviceLevel: string
  serviceDuration: number
  price: number
  date: string
  time: string
  name: string
  phone: string
}) => {

  const res = await fetch(`${API_URL}/bookings`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data),
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.message || "Booking failed")
  }

  return json
}