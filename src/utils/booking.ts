// src/utils/booking.ts

export const getNextDays = (count: number) => {
  const days: string[] = []
  const today = new Date()

  for (let i = 1; i <= count; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d.toISOString().split("T")[0])
  }

  return days
}

export const isVipTime = (time: string) => {
  const hour = Number(time.split(":")[0])
  return hour < 10 || hour >= 19
}

export const generateTimeSlots = (date: string) => {
  const d = new Date(date)
  const isWeekend = d.getDay() === 0 || d.getDay() === 6

  const start = isWeekend ? 10 : 9
  const end = isWeekend ? 22 : 21

  const slots: string[] = []

  for (let h = start; h < end; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`)
    slots.push(`${String(h).padStart(2, "0")}:30`)
  }

  return slots
}

export const formatDate = (d: string, lang: string) =>
  new Date(d).toLocaleDateString(lang, {
    weekday: "short",
    day: "numeric",
    month: "short"
  })

export const formatPrice = (price: number, lang: string) => {
  if (typeof price !== "number" || isNaN(price)) return "-"
  return price.toLocaleString(lang === "ru" ? "ru-RU" : "en-US")
}

export const getAllServices = (services: any[]) => {
  if (!services?.length) return []

  return services.flatMap((c) => {
    if (c.groups) {
      return c.groups.flatMap((g: any) => g.services || [])
    }

    if (c.services) {
      return c.services
    }

    return []
  })
}

export const getCategoryServices = (services: any[], category: string) => {
  if (!services?.length || !category) return []

  const cat = services.find((c) => {
    return (
      c.id === category ||
      c.nameKey === category ||
      c.id?.toLowerCase().includes(category.toLowerCase()) ||
      category.toLowerCase().includes(c.id?.toLowerCase())
    )
  })

  if (!cat) return []

  if (cat.groups) {
    return cat.groups.flatMap((g: any) => g.services || [])
  }

  if (cat.services) {
    return cat.services
  }

  return []
}

export const parseServiceKey = (key: string) => {
  if (!key) return { serviceId: "", level: "" }
  const [serviceId, level] = key.split("_")
  return { serviceId, level }
}

export const getSelectedService = (allServices: any[], serviceId: string) => {
  return allServices.find((s) => s.id === serviceId)
}

const PRICES = [
  { level: "master", label: "Мастер", price: 200000 },
  { level: "top", label: "Топ мастер", price: 300000 },
  { level: "premium", label: "Премиум", price: 400000 }
]

export const getPriceByLevel = (level: string) => {
  return PRICES.find((p) => p.level === level)
}

export const getBranchById = (
  branches: any[],
  branchId: string | null
) => {
  return branches.find((b) => b._id === branchId)
}

export const serviceDetails: Record<string, any> = {
  "services.classic_extension": {
    title: "Наращивание ресниц",
    description: "(используется обычный клей)",
    extra: "любой объем / эффект / изгиб"
  },
  "services.led_extension": {
    title: "‼️ НОВИНКА\nНаращивание ресниц в LED технике",
    description: "(нано-клей, последнее слово в lash-индустрии)",
    extra: "любой объем / эффект / изгиб"
  },
  "services.lash_removal": {
    title: "Снятие ресниц",
    description: "без последующего наращивания"
  },
  "services.colored_lashes": {
    title: "Цветные ресницы"
  }
}