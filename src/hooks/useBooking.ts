// src/hooks/useBooking.ts
import { useState, useEffect, useMemo } from "react"

import { useServices } from "@/hooks/useServices"
import { useBranches } from "@/hooks/useBranches"
import { useAvailability } from "@/hooks/useAvailability"

import {
  getNextDays,
  generateTimeSlots,
  isVipTime,
  getAllServices,
  getCategoryServices,
  parseServiceKey,
  getSelectedService,
  getBranchById
} from "@/utils/booking"

export interface BookingState {
  service: string
  date: string
  time: string
  name: string
  phone: string
}

export function useBooking() {

  // ======================
  // DATA (API)
  // ======================

  const { data: services = [], isLoading, error } = useServices()
  console.log("SERVICES:", services)
  const { data: branches = [], isLoading: branchesLoading } = useBranches()

  // ======================
  // STATE
  // ======================

  const [booking, setBooking] = useState<BookingState>({
    service: "",
    date: "",
    time: "",
    name: "",
    phone: ""
  })

  const [branchId, setBranchId] = useState<string | null>(null)
  const [category, setCategory] = useState("")
  const [step, setStep] = useState(1)

  const [modalService, setModalService] = useState<any | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  // ======================
  // EFFECTS
  // ======================

  useEffect(() => {
    if (services?.length && !category) {
      setCategory(services[0].id)
    }
  }, [services, category])

  useEffect(() => {
    if (!booking.service) setStep(1)
    else if (!booking.date) setStep(2)
    else if (!booking.time) setStep(3)
    else setStep(4)
  }, [booking])

    useEffect(() => {
    console.log("STEP:", step)
    console.log("BOOKING:", booking)
    }, [step, booking])

  // ======================
  // DERIVED
  // ======================

  const dates = useMemo(() => getNextDays(14), [])

  const timeSlots = useMemo(() => {
    if (!booking.date) return []
    return generateTimeSlots(booking.date)
  }, [booking.date])

  const allServices = useMemo(
    () => getAllServices(services),
    [services]
  )

  const categoryServices = useMemo(
    () => getCategoryServices(services, category),
    [services, category]
  )

  const { serviceId, level } = useMemo(
    () => parseServiceKey(booking.service),
    [booking.service]
  )

  const selectedService = useMemo(
    () => getSelectedService(allServices, serviceId),
    [allServices, serviceId]
  )

  const selectedPrice = useMemo(
    () => {
      const pricesRaw = selectedService?.prices
      const prices = Array.isArray(pricesRaw)
        ? (pricesRaw as Array<{ level?: string; price?: number }>)
        : []
      if (prices.length === 0) return undefined

      // Prefer exact level match (multi-level services)
      const match = prices.find((p) => p.level === level)
      if (match) return match

      // For single-price services we still select `"master"` in UI,
      // so fall back to the only available price.
      if (prices.length === 1) return prices[0]

      // Otherwise try master, then just use first price.
      return prices.find((p) => p.level === "master") ?? prices[0]
    },
    [selectedService, level]
  )

  const isVipSelected = useMemo(
    () => (booking.time ? isVipTime(booking.time) : false),
    [booking.time]
  )

  // VIP price is not counted automatically, only shown in summary
  const finalPrice = useMemo(() => {
    if (!selectedPrice) return 0
    return selectedPrice.price
  }, [selectedPrice])

  const branch = useMemo(
    () => getBranchById(branches, branchId),
    [branches, branchId]
  )

  const { data: bookedSlots = [] } = useAvailability(
    branchId,
    booking.date
  )

  // ======================
  // ACTIONS
  // ======================

  const selectBranch = (id: string) => {
    setBranchId(id)

    // ✅ НЕ трогаем name / phone
    setBooking((b) => ({
      ...b,
      service: "",
      date: "",
      time: ""
    }))
  }

  const selectCategory = (id: string) => {
    setCategory(id)

    setBooking((b) => ({
      ...b,
      service: "",
      date: "",
      time: ""
    }))
  }

  const selectService = (serviceId: string, level: string) => {
    setBooking((b) => ({
      ...b,
      service: `${serviceId}_${level}`
    }))
  }

  const selectDate = (date: string) => {
    setBooking((b) => ({
      ...b,
      date,
      time: ""
    }))
  }

  const selectTime = (time: string) => {
    setBooking((b) => ({
      ...b,
      time
    }))
  }

  const setName = (name: string) => {
    setBooking((b) => ({ ...b, name }))
  }

  const setPhone = (phone: string) => {
    setBooking((b) => ({ ...b, phone }))
  }

  // ✅ ФИКС (добавлен date reset)
  const resetService = () => {
    setBooking((b) => ({
      ...b,
      service: "",
      date: "",
      time: ""
    }))
  }

  const resetDate = () => {
    setBooking((b) => ({
      ...b,
      date: "",
      time: ""
    }))
  }

  const resetTime = () => {
    setBooking((b) => ({
      ...b,
      time: ""
    }))
  }

  // ======================
  // SUBMIT
  // ======================

  const buildPayload = () => {
    if (!selectedService || !branchId) return null

    const levelLabelMap: Record<string, string> = {
      master: "Мастер",
      top: "Топ мастер",
      premium: "Премиум",
      promo: "Промо"
    }
    const serviceLevel = String(selectedPrice?.level || "")
    const serviceLevelLabel = levelLabelMap[serviceLevel] || serviceLevel

    return {
      branchId,
      serviceId: selectedService.mongoId,
      serviceName: selectedService.nameKey, // перевод делай в UI
      serviceLevel: serviceLevelLabel,
      serviceDuration: selectedService.duration,
      price: finalPrice,
      date: booking.date,
      time: booking.time,
      name: booking.name,
      phone: booking.phone
    }
  }

  // ======================
  // RETURN
  // ======================

  return {
    // data
    services,
    branches,
    bookedSlots,

    // loading
    isLoading,
    branchesLoading,
    error,

    // state
    booking,
    step,
    category,
    branchId,
    modalService,
    confirmed,

    // derived
    dates,
    timeSlots,
    categoryServices,
    selectedService,
    selectedPrice,
    finalPrice,
    isVipSelected,
    branch,

    // actions
    setModalService,
    setConfirmed,

    selectBranch,
    selectCategory,
    selectService,
    selectDate,
    selectTime,
    setName,
    setPhone,

    resetService,
    resetDate,
    resetTime,

    buildPayload
  }
}