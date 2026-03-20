// src/components/booking/ServiceList.tsx
import { motion, AnimatePresence } from "framer-motion"

interface Props {
  services: any[]
  booking: any
  isLoading: boolean
  error: any

  formatPrice: (price: number) => string

  selectService: (serviceId: string, level: string) => void
  setModalService: (service: any) => void
  t: (key: string) => string
}

const getLevelLabel = (level: string) => {
  switch (level) {
    case "master":
      return "Мастер"
    case "top":
      return "Топ мастер"
    case "premium":
      return "Премиум"
    case "promo":
      return "Промо"
    default:
      return level
  }
}

const getCurrencyByService = (service: any, t: (key: string) => string) => {
  return service?.category === "hair" ? "USD" : t("services.currency")
}

export default function ServiceList({
  services,
  booking,
  isLoading,
  error,
  formatPrice,
  selectService,
  setModalService,
  t
}: Props) {

  return (
    <AnimatePresence>
      <motion.div
        key="services"
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
        ) : services?.length === 0 ? (
          <div className="col-span-2 text-muted-foreground">
            Нет доступных услуг
          </div>
        ) : services.map((service, index) => (

          <div
            key={service.mongoId ? `${service.mongoId}_${index}` : `${service.id}_${index}`}
            className={`p-6 rounded-2xl border bg-white text-left transition-all
            ${
              booking.service.startsWith(service.id)
                ? "border-primary shadow-sm opacity-100"
                : booking.service
                  ? "border-border hover:border-primary hover:shadow-sm opacity-60"
                  : "border-border hover:border-primary hover:shadow-sm"
            }`}
          >

            <div className="flex flex-col gap-3">

              {/* название */}
              <div className="font-medium">
                {t(service.nameKey)}
              </div>

              {/* уровни цен */}
              <div className="flex flex-col gap-1 text-sm">

                {(() => {
                  const servicePrices = Array.isArray(service?.prices)
                    ? service.prices
                    : []

                  const isMulti = servicePrices.length > 1

                  if (isMulti) {
                    return servicePrices.map((price) => {
                      const level = String((price as { level?: string }).level ?? "")
                      const priceValue = Number(
                        (price as { price?: number }).price
                      )
                      const currency = getCurrencyByService(service, t)

                      return (
                        <div
                          key={`${service.id}_${level}`}
                          className={`flex justify-between px-3 py-2 rounded-lg border cursor-pointer
                          ${
                            booking.service === `${service.id}_${level}`
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary"
                          }`}
                          onClick={() => selectService(service.id, level)}
                        >
                          <span className="text-muted-foreground">
                            {getLevelLabel(level)}
                          </span>

                          <span className="text-primary font-medium">
                            {formatPrice(priceValue)} {currency}
                          </span>
                        </div>
                      )
                    })
                  }

                  const singlePrice = servicePrices[0]
                  const singleValue = Number(singlePrice?.price)
                  const currency = getCurrencyByService(service, t)

                  return (
                    <div
                      key={`${service.id}_master`}
                      className={`flex justify-center px-3 py-2 rounded-lg border cursor-pointer
                      ${
                        booking.service === `${service.id}_master`
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary"
                      }`}
                      onClick={() => selectService(service.id, "master")}
                    >
                      <span className="text-primary font-medium">
                        {formatPrice(singleValue)} {currency}
                      </span>
                    </div>
                  )
                })()}

              </div>

              {/* подробнее */}
              <button
                onClick={() => setModalService(service)}
                className="text-xs text-muted-foreground underline text-left"
              >
                Подробнее
              </button>

            </div>

          </div>

        ))}

      </motion.div>
    </AnimatePresence>
  )
}