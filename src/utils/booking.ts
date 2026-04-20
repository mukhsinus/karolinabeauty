// src/utils/booking.ts

/** Salon calendar & slot math (Uzbekistan, no DST). */
export const BOOKING_TIMEZONE = "Asia/Tashkent"

/** Calendar YYYY-MM-DD in BOOKING_TIMEZONE for a given instant. */
export function formatYmdInBookingTz(instant: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BOOKING_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(instant)
}

function addCalendarDaysYmd(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split("-").map(Number)
  const t = Date.UTC(y, m - 1, d + delta, 12, 0, 0, 0)
  return formatYmdInBookingTz(new Date(t))
}

/**
 * Next `count` selectable days starting with **today** (in BOOKING_TIMEZONE).
 * Avoids `toISOString().split("T")[0]` UTC drift.
 */
export const getNextDays = (count: number) => {
  const days: string[] = []
  let ymd = formatYmdInBookingTz(new Date())
  for (let i = 0; i < count; i++) {
    days.push(ymd)
    ymd = addCalendarDaysYmd(ymd, 1)
  }
  return days
}

/** UTC ms for slot start: wall clock in Tashkent on calendar day `ymd`. */
export function parseSlotInstantUtcMs(ymd: string, timeHHmm: string): number {
  const [Y, M, D] = ymd.split("-").map(Number)
  const [hStr, mStr] = timeHHmm.split(":")
  const h = Number(hStr)
  const mi = Number(mStr ?? 0)
  return Date.UTC(Y, M - 1, D, h - 5, mi, 0, 0)
}

export function isYmdTodayInBookingTz(
  ymd: string,
  now: Date = new Date()
): boolean {
  return ymd === formatYmdInBookingTz(now)
}

/**
 * For **today** only: drop slots whose start time is not strictly after `now`.
 * Other dates: unchanged (server is source of truth).
 */
export function filterSlotsAfterNow<T extends { time: string }>(
  ymd: string,
  slots: T[],
  now: Date = new Date()
): T[] {
  if (!ymd || !Array.isArray(slots) || slots.length === 0) return slots
  if (!isYmdTodayInBookingTz(ymd, now)) return slots
  const nowMs = now.getTime()
  return slots.filter((s) => parseSlotInstantUtcMs(ymd, s.time) > nowMs)
}

export const isVipTime = (time: string) => {
  const hour = Number(time.split(":")[0])
  return hour < 10 || hour >= 19
}

export const generateTimeSlots = (date: string) => {
  const [y, m, d] = date.split("-").map(Number)
  /** Noon Tashkent ≈ 07:00 UTC same civil date → weekday matches salon calendar */
  const weekday = new Date(Date.UTC(y, m - 1, d, 7, 0, 0, 0)).getUTCDay()
  const isWeekend = weekday === 0 || weekday === 6

  const start = isWeekend ? 10 : 9
  const end = isWeekend ? 22 : 21

  const slots: string[] = []

  for (let h = start; h < end; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`)
    slots.push(`${String(h).padStart(2, "0")}:30`)
  }

  return slots
}

export const formatDate = (d: string, lang: string) => {
  const [y, m, day] = d.split("-").map(Number)
  if (!y || !m || !day) return d
  const instant = new Date(Date.UTC(y, m - 1, day, 12, 0, 0, 0))
  return instant.toLocaleDateString(lang === "ru" ? "ru-RU" : lang, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: BOOKING_TIMEZONE
  })
}

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
    const flat = cat.groups.flatMap((g: any) => g.services || [])
    const uniqueMap = new Map<string, any>()

    flat.forEach((service: any) => {
      const key =
        service?.mongoId ||
        service?._id ||
        service?.id ||
        service?.nameKey

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, service)
      }
    })

    return Array.from(uniqueMap.values())
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

export const getBranchById = (
  branches: any[],
  branchId: string | null
) => {
  if (!branchId || !Array.isArray(branches)) return undefined
  const want = String(branchId)
  return branches.find((b) => String(b?._id ?? b?.id ?? "") === want)
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