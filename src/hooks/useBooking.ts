// src/hooks/useBooking.ts
import { useState, useEffect, useMemo } from "react"

import { useServices } from "@/hooks/useServices"
import { useBranches } from "@/hooks/useBranches"
import { useAvailability } from "@/hooks/useAvailability"

import {
  getNextDays,
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

  // ======================
  // DERIVED
  // ======================

  const dates = useMemo(() => getNextDays(14), [])

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

      const lv = String(level || "").toLowerCase()
      const match = prices.find(
        (p) => String(p.level || "").toLowerCase() === lv
      )
      if (match) return match

      if (prices.length === 1) return prices[0]

      return prices.find((p) => p.level === "master") ?? prices[0]
    },
    [selectedService, level]
  )

  const { data: availabilityData, isLoading: availabilityLoading } =
    useAvailability(branchId, serviceId, level, booking.date)

  const availabilitySlots =
    availabilityData?.type === "slots" ? availabilityData.slots : []

  const isManualAvailability = availabilityData?.type === "manual"

  const isVipSelected = useMemo(() => {
    if (!booking.time) return false
    const row = availabilitySlots.find((s) => s.time === booking.time)
    return Boolean(row?.isVip)
  }, [booking.time, availabilitySlots])

  const finalPrice = useMemo(() => {
    if (!selectedPrice) return 0
    return selectedPrice.price
  }, [selectedPrice])

  const branch = useMemo(
    () => getBranchById(branches, branchId),
    [branches, branchId]
  )

  // ======================
  // ACTIONS
  // ======================

  const selectBranch = (id: string) => {
    setBranchId(id)

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

    return {
      branchId,
      serviceId: selectedService.mongoId,
      serviceName: selectedService.nameKey,
      serviceLevel: level, // 🔥 ВАЖНО: НЕ label, а raw значение
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
    availabilitySlots,
    availabilityLoading,
    isManualAvailability,

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