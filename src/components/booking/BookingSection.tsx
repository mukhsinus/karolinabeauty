// src/components/booking/BookingSection.tsx
// src/components/booking/BookingSection.tsx
import { useState } from "react"
import { useLanguage } from "@/i18n/LanguageContext"
import { createBooking } from "@/lib/api"
import { Check } from "lucide-react"

import { useBooking } from "@/hooks/useBooking"
import { formatDate, formatPrice } from "@/utils/booking"

import BranchSelector from "@/components/booking/BranchSelector"
import CategoryTabs from "@/components/booking/CategoryTabs"
import ServiceList from "@/components/booking/ServiceList"
import DateSelector from "@/components/booking/DateSelector"
import TimeSelector from "@/components/booking/TimeSelector"
import BookingForm from "@/components/booking/BookingForm"
import BookingSummary from "@/components/booking/BookingSummary"
import ServiceModal from "@/components/booking/ServiceModal"

export default function BookingSection() {
  const { t, lang } = useLanguage()
  const [showHint, setShowHint] = useState(true)

  const branchNamesMap: Record<string, string> = {
    "Чиланзар": "Филиал Дружба Народов",
    "Юнусабад": "Филиал Юнусабад"
  }

  const {
    services,
    branches,
    bookedSlots,

    isLoading,
    branchesLoading,
    error,

    booking,
    step,
    category,
    branchId,
    modalService,
    confirmed,

    dates,
    timeSlots,
    categoryServices,
    selectedService,
    selectedPrice,
    finalPrice,
    isVipSelected,
    branch,

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
  } = useBooking()

  const handleConfirm = async () => {
    const payload = buildPayload()
    if (!payload) return

    try {
      await createBooking({
        ...payload,
        serviceName: t(payload.serviceName)
      })
      setConfirmed(true)
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (confirmed) {
    return (
      <section className="py-32">
        <div className="max-w-xl mx-auto text-center">
          <Check className="mx-auto mb-6 text-primary" size={42} />
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

        <BranchSelector
          branches={branches}
          branchId={branchId}
          selectBranch={selectBranch}
          branchNamesMap={branchNamesMap}
          isLoading={branchesLoading}
          t={t}
        />

        {branchId && (
          <CategoryTabs
            services={services}
            category={category}
            selectCategory={selectCategory}
            isLoading={isLoading}
            error={error}
            t={t}
            showHint={showHint}
            setShowHint={setShowHint}
          />
        )}

        {branchId && (
          <div className="grid lg:grid-cols-[1fr,320px] gap-14">

            <div>

              {/* SERVICES */}
              {!booking.service ? (
                <ServiceList
                  services={categoryServices}
                  booking={booking}
                  isLoading={isLoading}
                  error={error}
                  formatPrice={(p: number) => formatPrice(p, lang)}
                  selectService={selectService}
                  setModalService={setModalService}
                  t={t}
                />
              ) : (
                <div className="mb-6 p-4 border rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-medium">
                      {selectedService ? t(selectedService.nameKey) : t("common.empty")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedPrice?.level === "master"
                        ? "Мастер"
                        : selectedPrice?.level === "top"
                          ? "Топ мастер"
                          : selectedPrice?.level === "premium"
                            ? "Премиум"
                            : selectedPrice?.level === "promo"
                              ? "Промо"
                              : ""}
                    </div>
                  </div>

                  <button
                    onClick={resetService}
                    className="text-sm text-primary"
                  >
                    Изменить
                  </button>
                </div>
              )}

              {/* DATE */}
              {booking.service && (
                !booking.date ? (
                  <DateSelector
                    dates={dates}
                    booking={booking}
                    selectDate={selectDate}
                    resetDate={resetDate}
                    formatDateLocal={(d) => formatDate(d, lang)}
                    t={t}
                  />
                ) : (
                  <div className="mb-6 p-4 border rounded-xl flex justify-between items-center">
                    <div className="font-medium">
                      {formatDate(booking.date, lang)}
                    </div>

                    <button
                      onClick={resetDate}
                      className="text-sm text-primary"
                    >
                      Изменить
                    </button>
                  </div>
                )
              )}

              {/* TIME */}
              {booking.date && (
                !booking.time ? (
                  <TimeSelector
                    timeSlots={timeSlots}
                    booking={booking}
                    bookedSlots={bookedSlots}
                    selectTime={selectTime}
                    resetTime={resetTime}
                    t={t}
                  />
                ) : (
                  <div className="mb-6 p-4 border rounded-xl flex justify-between items-center">
                    <div className="font-medium">
                      {booking.time}
                    </div>

                    <button
                      onClick={resetTime}
                      className="text-sm text-primary"
                    >
                      Изменить
                    </button>
                  </div>
                )
              )}

              {/* FORM */}
              {booking.time && (
                <BookingForm
                  booking={booking}
                  setName={setName}
                  setPhone={setPhone}
                  handleConfirm={handleConfirm}
                  t={t}
                />
              )}

            </div>

            <BookingSummary
              booking={booking}
              selectedService={selectedService}
              selectedPrice={selectedPrice}
              finalPrice={finalPrice}
              isVipSelected={isVipSelected}
              branch={branch}
              formatPrice={(p) => formatPrice(p, lang)}
              formatDate={(d) => formatDate(d, lang)}
              t={t}
              branchNamesMap={branchNamesMap}
            />

          </div>
        )}

      </div>

      <ServiceModal
        modalService={modalService}
        setModalService={setModalService}
        selectService={selectService}
        formatPrice={(p: number) => formatPrice(p, lang)}
        t={t}
      />

    </section>
  )
}