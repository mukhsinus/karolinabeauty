// src/lib/api.ts

const API_URL = "http://localhost:4000"

/*
GET availability
*/

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

  return res.json()
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