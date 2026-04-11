// src/components/booking/ServiceList.tsx
import { motion, AnimatePresence } from "framer-motion"
import { isPremiumLevelSelectableForBranch } from "@/utils/branchPremium"

interface Props {
  services: any[]
  booking: any
  branch: { slug?: string } | null | undefined
  isLoading: boolean
  error: any

  /** UI-only: drives enter/exit when branch or category changes */
  listTransitionKey: string

  formatPrice: (price: number) => string

  selectService: (serviceId: string, level: string) => void
  setModalService: (service: any) => void
  t: (key: string) => string
}

// ✅ теперь полностью через i18n
const getLevelLabel = (level: string, t: (key: string) => string) => {
  switch (level) {
    case "master":
      return t("services.basic_master")
    case "top":
      return t("services.top_master")
    case "premium":
      return t("services.premium_master")
    case "promo":
      return t("services.promo")
    default:
      return level
  }
}

const getCurrencyByService = (service: any, t: (key: string) => string) => {
  if (service?.currency === "USD" || service?.category === "hair") return "USD"
  return t("services.currency")
}

const staggerMs = 40

export default function ServiceList({
  services,
  booking,
  branch,
  isLoading,
  error,
  listTransitionKey,
  formatPrice,
  selectService,
  setModalService,
  t
}: Props) {

  return (
    <div className="mb-14 min-h-[12rem]">
      {isLoading ? (
        <div className="text-muted-foreground py-4">
          {t("common.loading_services")}
        </div>
      ) : error ? (
        <div className="text-red-500 py-4">
          {t("common.error_loading")}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={listTransitionKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeInOut" }}
            className="grid md:grid-cols-2 gap-4"
          >
            {services?.length === 0 ? (
              <div className="col-span-2 text-muted-foreground py-4">
                {t("common.no_services")}
              </div>
            ) : (
              services.map((service, index) => (
          <motion.div
            key={service.mongoId ? `${service.mongoId}_${index}` : `${service.id}_${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.22,
              delay: index * (staggerMs / 1000),
              ease: [0.25, 0.1, 0.25, 1]
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.995 }}
            className="will-change-transform"
          >
          <div
            className={`p-6 rounded-2xl border bg-white text-left h-full transition-[border-color,box-shadow,opacity] duration-200 ease-out
            ${
              booking.service.startsWith(service.id)
                ? "border-primary shadow-sm opacity-100"
                : booking.service
                  ? "border-border hover:border-primary hover:shadow-sm opacity-60"
                  : "border-border hover:border-primary hover:shadow-sm"
            }`}
          >

            <div className="flex flex-col gap-3">

              {/* NAME */}
              <div className="font-medium">
                {t(service.nameKey)}
              </div>

              {/* PRICES */}
              <div className="flex flex-col gap-1 text-sm">

                {(() => {
                  const servicePrices = Array.isArray(service?.prices)
                    ? service.prices
                    : []

                  if (servicePrices.length === 0) {
                    return (
                      <div className="text-sm text-muted-foreground px-2">
                        {t("common.no_services")}
                      </div>
                    )
                  }

                  const visiblePrices = servicePrices.filter((p) =>
                    isPremiumLevelSelectableForBranch(
                      branch,
                      String((p as { level?: string }).level ?? "master")
                    )
                  )

                  if (visiblePrices.length === 0) {
                    return (
                      <div className="text-sm text-muted-foreground px-2">
                        {t("booking.premium_not_at_branch")}
                      </div>
                    )
                  }

                  const isMulti = visiblePrices.length > 1

                  if (isMulti) {
                    return visiblePrices.map((price) => {
                      const level = String((price as { level?: string }).level ?? "")
                      const priceValue = Number(
                        (price as { price?: number }).price
                      )
                      const currency = getCurrencyByService(service, t)

                      return (
                        <div
                          key={`${service.id}_${level}`}
                          className={`flex justify-between px-3 py-2 rounded-lg border cursor-pointer transition-colors duration-150 ease-out
                          ${
                            booking.service === `${service.id}_${level}`
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary"
                          }`}
                          onClick={() => selectService(service.id, level)}
                        >
                          <span className="text-muted-foreground">
                            {getLevelLabel(level, t)}
                          </span>

                          <span className="text-primary font-medium">
                            {formatPrice(priceValue)} {currency}
                          </span>
                        </div>
                      )
                    })
                  }

                  const singlePrice = visiblePrices[0]
                  const singleLevel = String(singlePrice?.level ?? "master")
                  const singleValue = Number(singlePrice?.price)
                  const currency = getCurrencyByService(service, t)

                  return (
                    <div
                      key={`${service.id}_${singleLevel}`}
                      className={`flex justify-center px-3 py-2 rounded-lg border cursor-pointer transition-colors duration-150 ease-out
                      ${
                        booking.service === `${service.id}_${singleLevel}`
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary"
                      }`}
                      onClick={() => selectService(service.id, singleLevel)}
                    >
                      <span className="text-primary font-medium">
                        {formatPrice(singleValue)} {currency}
                      </span>
                    </div>
                  )
                })()}

              </div>

              {/* DETAILS */}
              <button
                onClick={() => setModalService(service)}
                className="text-xs text-muted-foreground underline text-left"
              >
                {t("common.details")}
              </button>

            </div>

          </div>
          </motion.div>

              ))
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}