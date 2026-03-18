// src/components/ServicesSection.tsx

import { useState, useRef } from "react"
import { useLanguage } from "@/i18n/LanguageContext"
import { useServices } from "@/hooks/useServices"
import { motion, AnimatePresence } from "framer-motion"

const formatPrice = (price: number) => {
  return price.toLocaleString("ru-RU")
}

// 🔥 ОБНОВЛЕННЫЕ ДЕТАЛИ УСЛУГ
const serviceDetails: Record<string, any> = {

  // РЕСНИЦЫ
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
  },

  // 🔥 БРОВИ (НОВОЕ)
  "services.brow_architecture": {
    title: "Архитектура бровей",
    description: "подбор формы с учетом типа лица"
  },

  "services.brow_correction": {
    title: "Коррекция бровей",
    description: "воском / пинцетом"
  },

  "services.brow_coloring": {
    title: "Окрашивание бровей",
    description: "на выбор: хна или краска"
  },

  "services.brow_lamination": {
    title: "Долговременная укладка бровей",
    description: "эффект «уложенных бровей»"
  },

  "services.brow_muslim": {
    title: "Мусульманская коррекция",
    description: "осветление нежелательных волосков"
  },

  "services.brow_set": {
    title: "СЕТ ВСЕ ВКЛЮЧЕНО",
    description: "архитектура + коррекция + окрашивание + укладка",
    extra: "выгоднее, чем по отдельности"
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

const ServicesSection = () => {

  const { t } = useLanguage()
  const { data: services, isLoading, error } = useServices()

  const [activeCategory, setActiveCategory] = useState(
    services?.[0]?.id || ""
  )

  const [modalService, setModalService] = useState<any | null>(null)

  const activeCat = services?.find(
    (c) => c.id === activeCategory
  )

  return (

    <section id="services" className="py-32 bg-background">

      <div className="max-w-7xl mx-auto px-6">

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
              <div className="text-sm text-muted-foreground">Загрузка...</div>
            ) : error ? (
              <div className="text-sm text-red-500">Ошибка загрузки</div>
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
          {activeCat?.groups.map((group) => (
            <div key={group.id}>
              <h3 className="font-display text-2xl md:text-3xl font-semibold text-center mb-12">
                {t(group.titleKey)}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

                {group.services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <MagneticCard>
                      <div className="group bg-card rounded-3xl p-8 border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-2xl">

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
                              {formatPrice(service.price)}
                              <span className="text-xs text-muted-foreground ml-1">
                                {t("services.currency")}
                              </span>
                            </span>

                            <div className="flex flex-col items-end gap-2">

                              <button
                                onClick={() => setModalService(service)}
                                className="text-xs text-muted-foreground underline"
                              >
                                Подробнее
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
                ))}

              </div>
            </div>
          ))}
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
                      {formatPrice(modalService.price)} {t("services.currency")}
                    </div>

                    <div className="pt-4 flex gap-3">

                      <a
                        href="/booking"
                        className="flex-1 text-center bg-primary text-white py-3 rounded-full"
                      >
                        Записаться
                      </a>

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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  )
}

export default ServicesSection