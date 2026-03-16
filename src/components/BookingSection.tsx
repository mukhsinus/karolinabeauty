// src/components/BookingSection.tsx

import { useState, useMemo, useEffect } from "react"
import { useLanguage } from "@/i18n/LanguageContext"
import { serviceCategories, getAllServices } from "@/data/services"
import { fetchAvailability, createBooking } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Calendar, Clock, User, MapPin } from "lucide-react"

interface BookingState {
  service: string
  date: string
  time: string
  name: string
  phone: string
}

interface Branch {
  id: string
  nameKey: string
  addressKey: string
}

const branches: Branch[] = [
  {
    id: "branch_center",
    nameKey: "branch.center.name",
    addressKey: "branch.center.address"
  },
  {
    id: "branch_chilanzar",
    nameKey: "branch.chilanzar.name",
    addressKey: "branch.chilanzar.address"
  }
]

const getNextDays = (count: number) => {
  const days: string[] = []
  const today = new Date()

  for (let i = 1; i <= count; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d.toISOString().split("T")[0])
  }

  return days
}

const generateTimeSlots = (date: string) => {
  const d = new Date(date)

  const isWeekend =
    d.getDay() === 0 ||
    d.getDay() === 6

  const start = isWeekend ? 10 : 9
  const end = isWeekend ? 22 : 21

  const slots: string[] = []

  for (let h = start; h < end; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`)
    slots.push(`${String(h).padStart(2, "0")}:30`)
  }

  return slots
}

export default function BookingSection() {

  const { t, lang } = useLanguage()

  const formatPrice = (price: number) =>
    price.toLocaleString(lang === "ru" ? "ru-RU" : "en-US")

  const services = getAllServices()

  const [branchId, setBranchId] = useState<string | null>(null)

  const [category, setCategory] = useState(serviceCategories[0].id)

  const [booking, setBooking] = useState<BookingState>({
    service: "",
    date: "",
    time: "",
    name: "",
    phone: ""
  })

  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [confirmed, setConfirmed] = useState(false)

  const dates = useMemo(() => getNextDays(14), [])

  const timeSlots = useMemo(() => {
    if (!booking.date) return []
    return generateTimeSlots(booking.date)
  }, [booking.date])

  const categoryData = serviceCategories.find(
    c => c.id === category
  )

  const categoryServices =
    categoryData?.groups?.flatMap(g => g.services) || []

  const selectedService = services.find(
    s => s.id === booking.service
  )

  useEffect(() => {

    if (!branchId || !booking.date) return

    const load = async () => {

      try {

        const data = await fetchAvailability(
          branchId,
          booking.date
        )

        setBookedSlots(data)

      } catch (error) {

        console.error("availability error", error)

      }

    }

    load()

  }, [branchId, booking.date])

  const handleConfirm = async () => {

    if (!selectedService || !branchId) return

    try {

      await createBooking({
        branchId,
        serviceId: selectedService.id,
        serviceName: selectedService.nameKey,
        serviceDuration: selectedService.duration,
        price: selectedService.price,
        date: booking.date,
        time: booking.time,
        name: booking.name,
        phone: booking.phone
      })

      setConfirmed(true)

    } catch (error: any) {

      alert(error.message)

    }

  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(lang, {
      weekday: "short",
      day: "numeric",
      month: "short"
    })

  if (confirmed) {

    return (

      <section className="py-32">

        <div className="max-w-xl mx-auto text-center">

          <Check
            className="mx-auto mb-6 text-primary"
            size={42}
          />

          <h3 className="text-3xl font-display mb-3">
            {t("booking.success")}
          </h3>

          <p className="text-muted-foreground">
            {t("booking.success_message")}
          </p>

        </div>

      </section>

    )

  }

  return (

    <section className="py-24">

      <div className="max-w-6xl mx-auto px-4">

        <h2 className="text-center text-5xl font-display mb-16">
          {t("booking.title")}
        </h2>

        <div className="mb-16">

          <h3 className="text-xl font-display mb-6 flex items-center gap-2">
            <MapPin size={18}/>
            {t("booking.select_branch")}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">

            {branches.map(branch => (

              <button
                key={branch.id}

                onClick={() => {
                  setBranchId(branch.id)
                  setBooking(b => ({
                    ...b,
                    service: "",
                    date: "",
                    time: ""
                  }))
                }}

                className={`p-6 border rounded-2xl text-left transition hover:shadow-md
                ${branchId === branch.id
                  ? "border-primary bg-primary/5"
                  : "border-border"}`}

              >

                <div className="font-semibold">
                  {t(branch.nameKey)}
                </div>

                <div className="text-sm text-muted-foreground mt-1">
                  {t(branch.addressKey)}
                </div>

              </button>

            ))}

          </div>

        </div>

        {/* CATEGORY TABS */}

        {branchId && (

        <div className="flex gap-3 overflow-x-auto pb-2 mb-14 whitespace-nowrap">

          {serviceCategories.map(cat => (

            <button
              key={cat.id}

              onClick={() => {

                setCategory(cat.id)

                setBooking(b => ({
                  ...b,
                  service: "",
                  date: "",
                  time: ""
                }))

              }}

              className={`shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl border text-sm font-medium transition-all
              ${category === cat.id
              ? "bg-primary text-white border-primary shadow-sm"
              : "bg-white border-border hover:border-primary hover:shadow-sm"}`}

            >

              <cat.icon size={16} />
              <span>{t(cat.nameKey)}</span>

            </button>

          ))}

        </div>

        )}

        {/* MAIN GRID */}

        {branchId && (

        <div className="grid lg:grid-cols-[1fr,320px] gap-14">

          {/* LEFT CONTENT */}

          <div>

            {/* SERVICES */}

            <AnimatePresence mode="wait">

              <motion.div
                key={category}

                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}

                className="grid md:grid-cols-2 gap-4 mb-14"
              >

                {categoryServices.map(service => (

                  <button
                    key={service.id}

                    onClick={() =>
                      setBooking(b => ({
                        ...b,
                        service: service.id
                      }))
                    }

                    className={`p-6 rounded-2xl border bg-white text-left transition-all
                    ${booking.service === service.id
                      ? "border-primary shadow-sm"
                      : "border-border hover:border-primary hover:shadow-sm"}`}

                  >

                    <div className="flex justify-between items-center">

                      <div className="font-medium">
                        {t(service.nameKey)}
                      </div>

                      <div className="text-primary text-sm">
                        {formatPrice(service.price)}
                      </div>

                    </div>

                  </button>

                ))}

              </motion.div>

            </AnimatePresence>

            {/* DATE */}

            {booking.service && (

            <>

              <div className="flex items-center gap-2 mb-4">

                <Calendar size={18}/>

                <h3 className="text-xl font-display">
                  {t("booking.select_date")}
                </h3>

              </div>

              <div className="grid grid-cols-7 gap-2 mb-14">

                {dates.map(date => (

                  <button
                    key={date}

                    onClick={() =>
                      setBooking(b => ({
                        ...b,
                        date,
                        time: ""
                      }))
                    }

                    className={`p-3 rounded-xl border text-sm
                    ${booking.date === date
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary"}`}

                  >

                    {formatDate(date)}

                  </button>

                ))}

              </div>

            </>

            )}

            {/* TIME */}

            {booking.date && (

            <>

              <div className="flex items-center gap-2 mb-4">

                <Clock size={18}/>

                <h3 className="text-xl font-display">
                  {t("booking.select_time")}
                </h3>

              </div>

              <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-14">

                {timeSlots.map(time => {

                  const isBooked =
                    bookedSlots.includes(`${booking.date}-${time}`)

                  return (

                    <button
                      key={time}

                      disabled={isBooked}

                      onClick={() =>
                        setBooking(b => ({
                          ...b,
                          time
                        }))
                      }

                      className={`py-3 rounded-xl border text-sm
                      ${isBooked
                        ? "opacity-30"
                        : booking.time === time
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary"}`}

                    >

                      {time}

                    </button>

                  )

                })}

              </div>

            </>

            )}

            {/* DETAILS */}

            {booking.time && (

            <div className="max-w-md">

              <div className="flex items-center gap-2 mb-4">

                <User size={18}/>

                <h3 className="text-xl font-display">
                  {t("booking.details")}
                </h3>

              </div>

              <div className="space-y-4">

                <input
                  type="text"
                  placeholder={t("booking.name")}
                  value={booking.name}

                  onChange={e =>
                    setBooking(b => ({
                      ...b,
                      name: e.target.value
                    }))
                  }

                  className="w-full border rounded-xl px-4 py-3"
                />

                <input
                  type="tel"
                  placeholder={t("booking.phone")}
                  value={booking.phone}

                  onChange={e =>
                    setBooking(b => ({
                      ...b,
                      phone: e.target.value
                    }))
                  }

                  className="w-full border rounded-xl px-4 py-3"
                />

                <button
                  onClick={handleConfirm}
                  className="w-full bg-primary text-white py-3 rounded-full"
                >
                  {t("booking.confirm_booking")}
                </button>

              </div>

            </div>

            )}

          </div>

          {/* SUMMARY */}

          <div className="lg:sticky lg:top-28 h-fit bg-card border rounded-2xl p-6">

            <h3 className="font-display text-lg mb-6">
              {t("booking.summary")}
            </h3>

            <div className="space-y-4 text-sm">

              <div>

                <div className="text-muted-foreground">
                  {t("booking.branch")}
                </div>

                <div className="font-medium">
                  {branches.find(b => b.id === branchId)?.nameKey ? t(branches.find(b => b.id === branchId)?.nameKey) : t("common.empty")}
                </div>

              </div>

              <div>

                <div className="text-muted-foreground">
                  {t("booking.service")}
                </div>

                <div className="font-medium">
                  {selectedService ? t(selectedService.nameKey) : t("common.empty")}
                </div>

              </div>

              <div>

                <div className="text-muted-foreground">
                  {t("booking.date")}
                </div>

                <div>
                  {booking.date ? formatDate(booking.date) : t("common.empty")}
                </div>

              </div>

              <div>

                <div className="text-muted-foreground">
                  {t("booking.time")}
                </div>

                <div>
                  {booking.time ? booking.time : t("common.empty")}
                </div>

              </div>

              {selectedService && (

              <div className="pt-4 border-t">

                <div className="text-muted-foreground">
                  {t("booking.price")}
                </div>

                <div className="text-primary text-lg font-semibold">
                  {formatPrice(selectedService.price)}
                </div>

              </div>

              )}

            </div>

          </div>

        </div>

        )}

      </div>

    </section>

  )

}