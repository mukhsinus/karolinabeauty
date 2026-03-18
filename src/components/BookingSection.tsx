// src/components/BookingSection.tsx

import { useState, useMemo, useEffect, useRef } from "react"
import { useLanguage } from "@/i18n/LanguageContext"
import { useServices } from "@/hooks/useServices"
import { fetchAvailability, createBooking } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Calendar, Clock, User, MapPin } from "lucide-react"
import { useAvailability } from "@/hooks/useAvailability"
import { useBranches } from "@/hooks/useBranches"

interface BookingState {
  service: string
  date: string
  time: string
  name: string
  phone: string
}

interface Branch {
  _id: string
  name: string
  address: string
}


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

const isVipTime = (time: string) => {
  const hour = Number(time.split(":")[0])
  return hour < 10 || hour >= 19
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
  
  const { data: branches = [], isLoading: branchesLoading } = useBranches()

  const branchNamesMap: Record<string, string> = {
    "Чиланзар": "Филиал Дружба Народов",
    "Юнусабад": "Филиал Юнусабад"
  }

  const [confirmed, setConfirmed] = useState(false)
  const [modalService, setModalService] = useState<any | null>(null)  

    // 🔥 UX HINT
  const [showHint, setShowHint] = useState(true)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const formatPrice = (price: number) =>
    price.toLocaleString(lang === "ru" ? "ru-RU" : "en-US")

  const serviceDetails: Record<string, any> = {
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


  const {data: services, isLoading, error} = useServices()


  const [branchId, setBranchId] = useState<string | null>(null)

  const [category, setCategory] = useState("")

  useEffect(() => {
    if (services?.length && !category) {
      setCategory(services[0].id)
    }
  }, [services, category])

  const [booking, setBooking] = useState<BookingState>({
    service: "",
    date: "",
    time: "",
    name: "",
    phone: ""
  })

  const { data: bookedSlots = [] } = useAvailability(branchId, booking.date)

  const dates = useMemo(() => getNextDays(14), [])

  const timeSlots = useMemo(() => {
    if (!booking.date) return []
    return generateTimeSlots(booking.date)
  }, [booking.date])

  const categoryData = services?.find(
    c => c.id === category
  )

  const categoryServices =
    categoryData?.groups?.flatMap(g => g.services) || []

  const allServices = (services || []).flatMap(c =>
    c.groups.flatMap(g => g.services)
  )

  const selectedService = allServices.find(
    s => s.id === booking.service
  )

  const isVipSelected = booking.time ? isVipTime(booking.time) : false

  const finalPrice = selectedService
    ? isVipSelected
      ? Math.round(selectedService.price * 1.3)
      : selectedService.price
    : 0

  const branch = branches.find((b: any) => b._id === branchId)


  const handleConfirm = async () => {

    if (!selectedService || !branchId) return

    try {

      await createBooking({
        branchId,
        serviceId: selectedService.mongoId, // Use MongoDB ObjectId
        serviceName: t(selectedService.nameKey),
        serviceDuration: selectedService.duration,
        price: finalPrice,
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

            {branchesLoading ? (

              <div className="text-sm text-muted-foreground">
                Загрузка филиалов...
              </div>

            ) : (

              branches.map((branch: any) => (

                <button
                  key={branch._id}

                  onClick={() => {
                    setBranchId(branch._id)

                    setBooking(b => ({
                      ...b,
                      service: "",
                      date: "",
                      time: ""
                    }))
                  }}

                  className={`p-6 border rounded-2xl text-left transition hover:shadow-md
                  ${branchId === branch._id
                    ? "border-primary bg-primary/5"
                    : "border-border"}`}

                >

                  <div className="font-semibold">
                    {branchNamesMap[branch.name] || branch.name}
                  </div>

                  <div className="text-sm text-muted-foreground mt-1">
                    {branch.address}
                  </div>

                </button>

              ))

            )}

          </div>

        </div>

        {/* CATEGORY TABS */}

        {branchId && (

          <div className="relative mb-14">

            <div
              ref={scrollRef}
              onScroll={() => setShowHint(false)}
              className="flex gap-3 overflow-x-auto pb-2 whitespace-nowrap no-scrollbar"
            >

              {isLoading ? (

                <div className="text-sm text-muted-foreground">
                  Загрузка услуг...
                </div>

              ) : error ? (

                <div className="text-sm text-red-500">
                  Ошибка загрузки
                </div>

              ) : (

                services?.map(cat => (

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
                    ${
                      category === cat.id
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-border"
                    }`}
                  >

                    <cat.icon size={18}/>
                    {t(cat.nameKey)}

                  </button>

                ))

              )}

            </div>

            {/* 🔥 СТРЕЛКА (только мобилка) */}

            {showHint && (
              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="lg:hidden absolute right-2 top-full mt-2 text-primary text-sm"
              >
                →
              </motion.div>
            )}

            {/* 🔥 ГРАДИЕНТ */}

            <div className="lg:hidden pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-background to-transparent" />

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

                {isLoading ? (
                  <div className="col-span-2 text-muted-foreground">
                    Загрузка услуг...
                  </div>
                ) : error ? (
                  <div className="col-span-2 text-red-500">
                    Ошибка загрузки
                  </div>
                ) : categoryServices?.map((service, index) => (

                  <button
                    key={`${service.id}-${index}-${category}`}

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

                    <div className="flex flex-col gap-3">

                      <div className="flex justify-between items-center">

                        <div className="font-medium">
                          {t(service.nameKey)}
                        </div>

                        <div className="text-primary text-sm">
                          {formatPrice(service.price)}
                        </div>

                      </div>

                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalService(service);
                        }}
                        className="text-xs text-muted-foreground underline text-left cursor-pointer"
                      >
                        Подробнее
                      </span>

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
                <p className="text-sm text-muted-foreground mb-4">
                  Студия работает с 10:00 до 20:00. Ранние и поздние записи — VIP (+доплата).
                </p>

              </div>

              <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-14">

                {timeSlots.map(time => {

                  const isBooked =
                    bookedSlots.includes(`${booking.date}-${time}`)

                  const isVip = isVipTime(time)

                  return (

                    <button
                      key={time}

                      disabled={isBooked}
                      title={isBooked ? "Уже занято" : ""}

                      onClick={() =>
                        setBooking(b => ({
                          ...b,
                          time
                        }))
                      }

                      className={`py-3 rounded-xl border text-sm relative

                      ${isBooked && "opacity-30"}

                      ${isVip
                        ? "border-primary bg-primary/5 text-primary"
                        : booking.time === time
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary"}
                      `}

                    >

                      <span>{time}</span>

                      {isVip && (
                        <span className="absolute top-1 right-2 text-[10px] font-medium text-primary">
                          VIP
                        </span>
                      )}

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
                  {branch ? (branchNamesMap[branch.name] || branch.name) : t("common.empty")}
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
                  {formatPrice(finalPrice)}

                  {isVipSelected && (
                    <span className="text-xs text-primary ml-2">
                      VIP
                    </span>
                  )}
                </div>

              </div>

              )}

            </div>

          </div>

        </div>

        )}

      </div>

  {modalService && (

    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
      onClick={() => setModalService(null)}
    >

      <div
        className="bg-white max-w-md w-full rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >

        {(() => {

          const details = serviceDetails[modalService.nameKey] || {}

          return (

            <div className="space-y-4">

              <h3 className="text-xl font-display whitespace-pre-line">
                {details.title || t(modalService.nameKey)}
              </h3>

              {details.description && (
                <p className="text-sm text-muted-foreground">
                  {details.description}
                </p>
              )}

              {details.extra && (
                <p className="text-sm">
                  {details.extra}
                </p>
              )}

              <div className="text-lg font-semibold text-primary pt-2">
                {formatPrice(modalService.price)} сум
              </div>

              <div className="pt-4 flex gap-3">

                <button
                  onClick={() => {
                    setBooking(b => ({
                      ...b,
                      service: modalService.id
                    }))
                    setModalService(null)
                  }}
                  className="flex-1 bg-primary text-white py-3 rounded-full"
                >
                  Записаться
                </button>

                <button
                  onClick={() => setModalService(null)}
                  className="px-4 py-3 border rounded-full"
                >
                  Закрыть
                </button>

              </div>

            </div>

          )

        })()}

      </div>

    </div>

  )}

    </section>

  )

} 