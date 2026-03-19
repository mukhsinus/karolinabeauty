// src/components/booking/ServiceList.tsx
import { motion, AnimatePresence } from "framer-motion"

interface Props {
  services: any[]
  booking: any
  isLoading: boolean
  error: any

  prices: any[]
  formatPrice: (price: number) => string

  selectService: (serviceId: string, level: string) => void
  setModalService: (service: any) => void
  t: (key: string) => string
}

export default function ServiceList({
  services,
  booking,
  isLoading,
  error,
  prices,
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
        ) : services.map((service) => (

          <div
            key={service.id}
            className={`p-6 rounded-2xl border bg-white text-left transition-all
            ${
              booking.service.startsWith(service.id)
                ? "border-primary shadow-sm"
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

                {prices.map((p, index) => (

                  <div
                    key={`${service.id}_${p.level}_${index}`}
                    className={`flex justify-between px-3 py-2 rounded-lg border cursor-pointer
                    ${
                      booking.service === `${service.id}_${p.level}`
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary"
                    }`}
                    onClick={() =>
                      selectService(service.id, p.level)
                    }
                  >

                    <span className="text-muted-foreground">
                      {p.label}
                    </span>

                    <span className="text-primary font-medium">
                      {formatPrice(p.price)}
                    </span>

                  </div>

                ))}

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