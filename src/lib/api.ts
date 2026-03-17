// src/lib/api.ts

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api"

/*
GET availability
*/


export const fetchServices = async () => {
  const res = await fetch(`${API_URL}/services`)
  if (!res.ok) {
    throw new Error("Failed to load services")
  }
  // The backend returns the array directly, not { data: ... }
  return res.json()
}

export const fetchBranches = async () => {
  const res = await fetch(`${API_URL}/branches`)
  if (!res.ok) {
    throw new Error("Failed to load branches")
  }
  return res.json()
}

export const fetchAvailability = async (
  branchId: string,
  date: string
) => {
  const res = await fetch(
    `${API_URL}/availability?branchId=${branchId}&date=${date}`
  )
  if (!res.ok) {
    throw new Error("Failed to load availability")
  }
  const json = await res.json();
  // Defensive: if backend returns { data: [...] }, return just the array
  if (json && Array.isArray(json.data)) return json.data;
  if (Array.isArray(json)) return json;
  return [];
}

/*
POST booking
*/

export const createBooking = async (data: {
  branchId: string
  serviceId: string
  serviceName: string
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