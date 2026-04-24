// src/components/ServicesSection.tsx

import { useState, useRef } from "react"
import { useLanguage } from "@/i18n/LanguageContext"
import { useServices } from "@/hooks/useServices"
import { motion, AnimatePresence } from "framer-motion"

const formatPrice = (price: number, lang: string) => {
  if (typeof price !== "number" || isNaN(price)) return "-"
  const locale =
    lang === "uz" ? "uz-UZ" : lang === "en" ? "en-US" : "ru-RU"
  return price.toLocaleString(locale)
}

const LASHES_STRUCTURED_NAME_KEYS = new Set([
  "services.classic_extension",
  "services.led_extension",
  "services.lashes_2_3d",
  "services.author_effect",
  "services.lashes_4_6d",
  "services.hollywood"
])

function priceAtLevel(
  service: { prices?: Array<{ level?: string; price?: number }> } | undefined,
  level: string
): number | undefined {
  if (!service?.prices?.length) return undefined
  const lv = level.toLowerCase()
  const row = service.prices.find(
    (p) => String(p.level ?? "").toLowerCase() === lv
  )
  const n = Number(row?.price)
  return Number.isFinite(n) ? n : undefined
}

function findServiceByKey(services: any[], nameKey: string) {
  return services.find((s) => s.nameKey === nameKey)
}

const getCurrencyByService = (service: any, t: (key: string) => string) => {
  if (service?.currency === "USD" || service?.category === "hair") return "USD"
  return t("services.currency")
}

const getDisplayPriceParts = (service: any) => {
  const arr = Array.isArray(service?.prices) ? service.prices : []
  const nums = arr
    .map((p: { price?: number }) => Number(p.price))
    .filter((n: number) => Number.isFinite(n))
  if (nums.length === 0) {
    return { isRange: false, min: service?.price, max: service?.price }
  }
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  return { isRange: nums.length > 1 && min !== max, min, max }
}

// ✅ ПЕРЕВЕДЕНО НА i18n
const serviceDetails: Record<string, any> = {

  "services.classic_extension": {
    title: "services.details.classic.title",
    description: "services.details.classic.description",
    extra: "services.details.classic.extra"
  },

  "services.led_extension": {
    title: "services.details.led.title",
    description: "services.details.led.description",
    extra: "services.details.led.extra"
  },

  "services.lash_removal": {
    title: "services.details.removal.title",
    description: "services.details.removal.description"
  },

  "services.colored_lashes": {
    title: "services.details.colored.title"
  },

  "services.brow_architecture": {
    title: "services.details.brow_architecture.title",
    description: "services.details.brow_architecture.description"
  },

  "services.brow_correction": {
    title: "services.details.brow_correction.title",
    description: "services.details.brow_correction.description"
  },

  "services.brow_coloring": {
    title: "services.details.brow_coloring.title",
    description: "services.details.brow_coloring.description"
  },

  "services.brow_lamination": {
    title: "services.details.brow_lamination.title",
    description: "services.details.brow_lamination.description"
  },

  "services.brow_muslim": {
    title: "services.details.brow_muslim.title",
    description: "services.details.brow_muslim.description"
  },

  "services.brow_set": {
    title: "services.details.brow_set.title",
    description: "services.details.brow_set.description",
    extra: "services.details.brow_set.extra"
  }
}

const MagneticCard = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement | null>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const deltaX = (x - centerX) * 0.15
    const deltaY = (y - centerY) * 0.15

    el.style.transform = `translate(${deltaX}px, ${deltaY}px)`
  }

  const handleLeave = () => {
    if (!ref.current) return
    ref.current.style.transform = "translate(0px, 0px)"
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      style={{ transition: "transform 0.2s ease-out" }}
      className="will-change-transform"
    >
      {children}
    </div>
  )
}

function LashTierCard({
  label,
  price,
  service,
  lang,
  t,
  motionIndex,
  setModalService
}: {
  label: string
  price: number | undefined
  service: any
  lang: string
  t: (key: string) => string
  motionIndex: number
  setModalService: (s: any) => void
}) {
  const cur = service
    ? getCurrencyByService(service, t)
    : t("services.currency")
  const canOpen = Boolean(service)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: motionIndex * 0.04 }}
    >
      <MagneticCard>
        <div className="group bg-card rounded-2xl p-6 md:p-7 border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-xl h-full flex flex-col justify-between min-h-[132px]">
          <p className="text-lg font-medium mb-4">{label}</p>
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <span className="text-primary font-semibold text-2xl">
              {typeof price === "number" ? formatPrice(price, lang) : "—"}
              <span className="text-xs text-muted-foreground ml-1 font-normal">
                {cur}
              </span>
            </span>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <button
                type="button"
                disabled={!canOpen}
                onClick={() => {
                  if (!canOpen) return
                  setModalService(
                    typeof price === "number" && Number.isFinite(price)
                      ? { ...service, _servicesUiPrice: price }
                      : service
                  )
                }}
                className="text-xs text-muted-foreground underline disabled:opacity-40"
              >
                {t("common.details")}
              </button>
              <a
                href="/booking"
                className="opacity-0 group-hover:opacity-100 transition text-sm font-medium text-primary"
              >
                {t("services.book")}
              </a>
            </div>
          </div>
        </div>
      </MagneticCard>
    </motion.div>
  )
}

function LashesStructuredGrid({
  services,
  lang,
  t,
  setModalService
}: {
  services: any[]
  lang: string
  t: (key: string) => string
  setModalService: (s: any) => void
}) {
  const classic = findServiceByKey(services, "services.classic_extension")
  const led = findServiceByKey(services, "services.led_extension")
  const v23 = findServiceByKey(services, "services.lashes_2_3d")
  const author = findServiceByKey(services, "services.author_effect")
  const v46 = findServiceByKey(services, "services.lashes_4_6d")
  const hollywood = findServiceByKey(services, "services.hollywood")

  let motionIndex = 0

  const block3Rows: {
    service: any
    price: number | undefined
    labelKey: string
  }[] = []
  if (classic) {
    block3Rows.push({
      service: classic,
      price: priceAtLevel(classic, "premium"),
      labelKey: "services.classic_extension"
    })
  }
  for (const svc of [v23, author, v46, hollywood]) {
    if (!svc) continue
    block3Rows.push({
      service: svc,
      price: priceAtLevel(svc, "premium"),
      labelKey: svc.nameKey
    })
  }

  return (
    <div className="space-y-16 md:space-y-20 max-w-5xl mx-auto">
      {classic && (
        <section>
          <h4 className="font-display text-xl md:text-2xl font-semibold text-center mb-8">
            {t("services.classic_extension")}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <LashTierCard
              label={t("services.basic_master")}
              price={priceAtLevel(classic, "master")}
              service={classic}
              lang={lang}
              t={t}
              motionIndex={motionIndex++}
              setModalService={setModalService}
            />
            <LashTierCard
              label={t("services.top_master_regina")}
              price={priceAtLevel(classic, "top")}
              service={classic}
              lang={lang}
              t={t}
              motionIndex={motionIndex++}
              setModalService={setModalService}
            />
          </div>
        </section>
      )}

      {led && (
        <section>
          <h4 className="font-display text-xl md:text-2xl font-semibold text-center mb-8">
            {t("services.led_extension")}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <LashTierCard
              label={t("services.basic_master")}
              price={priceAtLevel(led, "master")}
              service={led}
              lang={lang}
              t={t}
              motionIndex={motionIndex++}
              setModalService={setModalService}
            />
            <LashTierCard
              label={t("services.top_master_regina")}
              price={priceAtLevel(led, "top")}
              service={led}
              lang={lang}
              t={t}
              motionIndex={motionIndex++}
              setModalService={setModalService}
            />
          </div>
        </section>
      )}

      {block3Rows.length > 0 && (
        <section>
          <h4 className="font-display text-xl md:text-2xl font-semibold text-center mb-8">
            {t("services.premium_master")}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {block3Rows.map((row) => (
              <LashTierCard
                key={row.service.id + row.labelKey}
                label={t(row.labelKey)}
                price={row.price}
                service={row.service}
                lang={lang}
                t={t}
                motionIndex={motionIndex++}
                setModalService={setModalService}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

const ServicesSection = () => {

  const { t, lang } = useLanguage()
  const { data: services, isLoading, error } = useServices()

  const [activeCategory, setActiveCategory] = useState(
    services?.[0]?.id || ""
  )

  const [modalService, setModalService] = useState<any | null>(null)

  const activeCat = services?.find(
    (c) => c.id === activeCategory
  )

  return (

    <section id="services" className="py-24 md:py-32 bg-background">

      <div className="container mx-auto px-4 md:px-6">

        {/* HEADER */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-6">
            {t("services.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {t("services.subtitle")}
          </p>
        </motion.div>

        {/* CATEGORY TABS */}

        <div className="relative">

          <div className="flex gap-3 overflow-x-auto lg:overflow-visible lg:flex-wrap lg:justify-center pb-2 mb-20 whitespace-nowrap no-scrollbar">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">
                {t("common.loading")}
              </div>
            ) : error ? (
              <div className="text-sm text-red-500">
                {t("common.error_loading")}
              </div>
            ) : (
              services?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 flex items-center px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === cat.id
                      ? "bg-primary text-white shadow-lg"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <cat.icon size={18} className="mr-2" />
                  {t(cat.nameKey)}
                </button>
              ))
            )}
          </div>

          <motion.div
            animate={{ x: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="lg:hidden absolute right-2 top-full mt-2 text-primary text-sm"
          >
            →
          </motion.div>

          <div className="lg:hidden pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-background to-transparent" />

        </div>

        {/* SERVICES */}

        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-24"
        >
          {activeCat?.groups.map((group) => {
            const isLashesLayout =
              activeCategory === "lashes" &&
              Array.isArray(group.services) &&
              group.services.length > 0

            const remainingLashServices = isLashesLayout
              ? group.services.filter(
                  (s: { nameKey?: string }) =>
                    !LASHES_STRUCTURED_NAME_KEYS.has(String(s?.nameKey ?? ""))
                )
              : group.services

            const renderDefaultServiceCard = (
              service: (typeof group.services)[0],
              index: number
            ) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MagneticCard>
                  <div className="group bg-card rounded-2xl p-6 md:p-8 border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-2xl">
                    <div className="flex flex-col justify-between h-full">
                      <p className="text-lg font-medium mb-6">
                        {t(service.nameKey)}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-primary font-semibold text-2xl">
                          {service.isFrom && (
                            <span className="text-muted-foreground text-sm mr-1">
                              {t("services.from")}
                            </span>
                          )}
                          {(() => {
                            const { isRange, min, max } =
                              getDisplayPriceParts(service)
                            if (
                              isRange &&
                              typeof min === "number" &&
                              typeof max === "number"
                            ) {
                              return (
                                <>
                                  {formatPrice(min, lang)} –{" "}
                                  {formatPrice(max, lang)}
                                </>
                              )
                            }
                            return formatPrice(
                              typeof min === "number" ? min : service.price,
                              lang
                            )
                          })()}
                          <span className="text-xs text-muted-foreground ml-1">
                            {getCurrencyByService(service, t)}
                          </span>
                        </span>

                        <div className="flex flex-col items-end gap-2">
                          <button
                            type="button"
                            onClick={() => setModalService(service)}
                            className="text-xs text-muted-foreground underline"
                          >
                            {t("common.details")}
                          </button>

                          <a
                            href="/booking"
                            className="opacity-0 group-hover:opacity-100 transition text-sm font-medium text-primary"
                          >
                            {t("services.book")}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </MagneticCard>
              </motion.div>
            )

            return (
              <div key={group.id}>
                <h3 className="font-display text-2xl md:text-3xl font-semibold text-center mb-12">
                  {t(group.titleKey)}
                </h3>

                {isLashesLayout ? (
                  <>
                    <LashesStructuredGrid
                      services={group.services}
                      lang={lang}
                      t={t}
                      setModalService={setModalService}
                    />
                    {remainingLashServices.length > 0 && (
                      <>
                        <p className="text-sm font-medium text-muted-foreground text-center mt-20 mb-8">
                          {t("booking.lashes_more_services")}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
                          {remainingLashServices.map((service, index) =>
                            renderDefaultServiceCard(service, index)
                          )}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
                    {group.services.map((service, index) =>
                      renderDefaultServiceCard(service, index)
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </motion.div>

      </div>

      {/* MODAL */}

      <AnimatePresence>
        {modalService && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalService(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white max-w-md w-full rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {

                const details = serviceDetails[modalService.nameKey] || {}

                return (
                  <div className="space-y-4">

                    <h3 className="text-xl font-display whitespace-pre-line">
                      {details.title ? t(details.title) : t(modalService.nameKey)}
                    </h3>

                    {details.description && (
                      <p className="text-sm text-muted-foreground">
                        {t(details.description)}
                      </p>
                    )}

                    {details.extra && (
                      <p className="text-sm">
                        {t(details.extra)}
                      </p>
                    )}

                    <div className="text-lg font-semibold text-primary pt-2">
                      {(() => {
                        const ui = modalService._servicesUiPrice
                        if (
                          typeof ui === "number" &&
                          Number.isFinite(ui)
                        ) {
                          return (
                            <>
                              {formatPrice(ui, lang)}{" "}
                              {getCurrencyByService(modalService, t)}
                            </>
                          )
                        }
                        const { isRange, min, max } =
                          getDisplayPriceParts(modalService)
                        if (
                          isRange &&
                          typeof min === "number" &&
                          typeof max === "number"
                        ) {
                          return (
                            <>
                              {formatPrice(min, lang)} –{" "}
                              {formatPrice(max, lang)}{" "}
                              {getCurrencyByService(modalService, t)}
                            </>
                          )
                        }
                        return (
                          <>
                            {formatPrice(
                              typeof min === "number"
                                ? min
                                : modalService.price,
                              lang
                            )}{" "}
                            {getCurrencyByService(modalService, t)}
                          </>
                        )
                      })()}
                    </div>

                    <div className="pt-4 flex gap-3">

                      <a
                        href="/booking"
                        className="flex-1 text-center bg-primary text-white py-3 rounded-full"
                      >
                        {t("services.book")}
                      </a>

                      <button
                        onClick={() => setModalService(null)}
                        className="px-4 py-3 border rounded-full"
                      >
                        {t("common.close")}
                      </button>

                    </div>

                  </div>
                )

              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  )
}

export default ServicesSection