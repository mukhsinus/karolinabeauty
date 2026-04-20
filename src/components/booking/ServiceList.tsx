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

  /** When `lashes`, classic vs LED extensions are grouped into two top-level cards */
  category?: string
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

/** Classic (non-LED) extension rows — volumes share one booking card */
const LASH_CLASSIC_EXTENSION_NAME_KEYS = new Set([
  "services.classic_extension",
  "services.classic",
  "services.lashes_2_3d",
  "services.author_effect",
  "services.lashes_4_6d"
])

const LASH_CLASSIC_ORDER = [
  "services.classic_extension",
  "services.classic",
  "services.lashes_2_3d",
  "services.author_effect",
  "services.lashes_4_6d"
]

function isLashLedService(service: any) {
  const key = String(service?.nameKey ?? "")
  if (key.toLowerCase().includes("led")) return true
  const name = String(service?.name ?? "")
  return name.toUpperCase().includes("LED")
}

function isLashClassicExtensionService(service: any) {
  return LASH_CLASSIC_EXTENSION_NAME_KEYS.has(String(service?.nameKey ?? ""))
}

function partitionLashesBookingServices(services: any[]) {
  const classic: any[] = []
  const led: any[] = []
  const other: any[] = []

  for (const s of services) {
    if (isLashLedService(s)) led.push(s)
    else if (isLashClassicExtensionService(s)) classic.push(s)
    else other.push(s)
  }

  classic.sort(
    (a, b) =>
      LASH_CLASSIC_ORDER.indexOf(a.nameKey) -
      LASH_CLASSIC_ORDER.indexOf(b.nameKey)
  )
  led.sort((a, b) => String(a.nameKey).localeCompare(String(b.nameKey)))

  return { classic, led, other }
}

function ServicePricesBlock({
  service,
  booking,
  branch,
  selectService,
  formatPrice,
  t
}: {
  service: any
  booking: any
  branch: Props["branch"]
  selectService: Props["selectService"]
  formatPrice: Props["formatPrice"]
  t: Props["t"]
}) {
  const servicePrices = Array.isArray(service?.prices) ? service.prices : []

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
    return (
      <>
        {visiblePrices.map((price) => {
          const level = String((price as { level?: string }).level ?? "")
          const priceValue = Number((price as { price?: number }).price)
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
        })}
      </>
    )
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
}

function LashExtensionGroupCard({
  title,
  variantServices,
  booking,
  branch,
  index,
  selectService,
  setModalService,
  formatPrice,
  t
}: {
  title: string
  variantServices: any[]
  booking: any
  branch: Props["branch"]
  index: number
  selectService: Props["selectService"]
  setModalService: Props["setModalService"]
  formatPrice: Props["formatPrice"]
  t: Props["t"]
}) {
  const groupHasSelection = variantServices.some((s) =>
    booking.service.startsWith(s.id)
  )
  const groupDimmed = Boolean(booking.service) && !groupHasSelection

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.22,
        delay: index * (staggerMs / 1000),
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      className="will-change-transform"
    >
      <div
        className={`p-6 rounded-2xl border-2 bg-white text-left h-full transition-[border-color,box-shadow,opacity] duration-200 ease-out
          ${
            groupHasSelection
              ? "border-primary shadow-md ring-1 ring-primary/10 opacity-100"
              : "border-border hover:border-primary/40 hover:shadow-sm"
          }
          ${groupDimmed ? "opacity-60" : ""}`}
      >
        <h3 className="font-display text-lg font-semibold mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground mb-5">
          {t("booking.lashes_pick_level_hint")}
        </p>

        <div className="flex flex-col gap-6">
          {variantServices.map((service, vi) => (
            <div
              key={service.mongoId ?? service.id}
              className={vi > 0 ? "pt-6 border-t border-border" : ""}
            >
              <div className="text-sm font-medium mb-3">{t(service.nameKey)}</div>
              <div className="flex flex-col gap-1 text-sm">
                <ServicePricesBlock
                  service={service}
                  booking={booking}
                  branch={branch}
                  selectService={selectService}
                  formatPrice={formatPrice}
                  t={t}
                />
              </div>
              <button
                type="button"
                onClick={() => setModalService(service)}
                className="mt-2 text-xs text-muted-foreground underline text-left"
              >
                {t("common.details")}
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

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
  t,
  category
}: Props) {
  const isLashesCategory = category === "lashes"
  const partitioned =
    isLashesCategory && Array.isArray(services) && services.length > 0
      ? partitionLashesBookingServices(services)
      : null

  return (
    <div className="mb-14 min-h-[12rem]">
      {isLoading ? (
        <div className="text-muted-foreground py-4">
          {t("common.loading_services")}
        </div>
      ) : error ? (
        <div className="text-red-500 py-4">{t("common.error_loading")}</div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={listTransitionKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeInOut" }}
            className={
              partitioned
                ? "flex flex-col gap-8"
                : "grid md:grid-cols-2 gap-4"
            }
          >
            {services?.length === 0 ? (
              <div className="text-muted-foreground py-4">
                {t("common.no_services")}
              </div>
            ) : partitioned ? (
              <>
                {(partitioned.classic.length > 0 ||
                  partitioned.led.length > 0) && (
                  <div
                    className={`grid gap-4 md:gap-6 ${
                      partitioned.classic.length > 0 &&
                      partitioned.led.length > 0
                        ? "md:grid-cols-2"
                        : "md:grid-cols-1"
                    }`}
                  >
                    {partitioned.classic.length > 0 && (
                      <LashExtensionGroupCard
                        title={t("booking.lashes_classic_title")}
                        variantServices={partitioned.classic}
                        booking={booking}
                        branch={branch}
                        index={0}
                        selectService={selectService}
                        setModalService={setModalService}
                        formatPrice={formatPrice}
                        t={t}
                      />
                    )}
                    {partitioned.led.length > 0 && (
                      <LashExtensionGroupCard
                        title={t("services.led_extension")}
                        variantServices={partitioned.led}
                        booking={booking}
                        branch={branch}
                        index={partitioned.classic.length > 0 ? 1 : 0}
                        selectService={selectService}
                        setModalService={setModalService}
                        formatPrice={formatPrice}
                        t={t}
                      />
                    )}
                  </div>
                )}

                {partitioned.other.length > 0 && (
                  <div>
                    {(partitioned.classic.length > 0 ||
                      partitioned.led.length > 0) && (
                      <div className="text-sm font-medium text-muted-foreground mb-3">
                        {t("booking.lashes_more_services")}
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      {partitioned.other.map((service, index) => (
                        <motion.div
                          key={
                            service.mongoId
                              ? `${service.mongoId}_other_${index}`
                              : `${service.id}_other_${index}`
                          }
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.22,
                            delay:
                              (index + 2) * (staggerMs / 1000),
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
                              <div className="font-medium">
                                {t(service.nameKey)}
                              </div>
                              <div className="flex flex-col gap-1 text-sm">
                                <ServicePricesBlock
                                  service={service}
                                  booking={booking}
                                  branch={branch}
                                  selectService={selectService}
                                  formatPrice={formatPrice}
                                  t={t}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setModalService(service)}
                                className="text-xs text-muted-foreground underline text-left"
                              >
                                {t("common.details")}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              services.map((service, index) => (
                <motion.div
                  key={
                    service.mongoId
                      ? `${service.mongoId}_${index}`
                      : `${service.id}_${index}`
                  }
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
                      <div className="font-medium">{t(service.nameKey)}</div>
                      <div className="flex flex-col gap-1 text-sm">
                        <ServicePricesBlock
                          service={service}
                          booking={booking}
                          branch={branch}
                          selectService={selectService}
                          formatPrice={formatPrice}
                          t={t}
                        />
                      </div>
                      <button
                        type="button"
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
