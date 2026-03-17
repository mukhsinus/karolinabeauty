// src/components/FloatingPromo.tsx
import { useEffect, useState } from "react"
import { useServices } from "@/hooks/useServices"
import { useLanguage } from "@/i18n/LanguageContext"
import { motion, AnimatePresence } from "framer-motion"
import { useLocation } from "react-router-dom"

const formatPrice = (price: number) =>
  price.toLocaleString("ru-RU")

const HIDE_DURATION = 1000 * 60 * 60
const SHOW_DELAY = 5000

export default function FloatingPromo() {

  const { services } = useServices()
  const { t } = useLanguage()
  const location = useLocation()

  const [visible, setVisible] = useState(false)

  const allServices = services.flatMap(c =>
    c.groups.flatMap(g => g.services)
  )

  const promo = allServices.find(s => s.isPromo)

  useEffect(() => {

    if (location.pathname === "/booking") {
      setVisible(false)
      return
    }

    const bookedUntil = localStorage.getItem("promo_booked_until")

    if (bookedUntil) {
      const now = Date.now()

      if (now < Number(bookedUntil)) {
        setVisible(false)
        return
      } else {
        localStorage.removeItem("promo_booked_until")
      }
    }

    const timer = setTimeout(() => {
      setVisible(true)
    }, SHOW_DELAY)

    return () => clearTimeout(timer)

  }, [location.pathname])

  if (!promo || !visible) return null

  return (

    <AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed bottom-6 right-6 z-50"
      >

        <div className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-5 w-[300px]">

          <div className="flex justify-between items-start mb-3">

            <span className="text-[11px] font-semibold text-primary tracking-[0.12em] uppercase">
              акция
            </span>

            <button
              onClick={() => setVisible(false)}
              className="text-xs text-muted-foreground hover:text-black transition"
            >
              ✕
            </button>

          </div>

          <div className="text-sm font-medium mb-1 leading-snug">
            {t(promo.nameKey)}
          </div>

          <div className="text-xs text-muted-foreground mb-4 leading-relaxed">
            {promo.nameKey.includes("lamination")
              ? "С витаминами и окрашиванием"
              : "Специальное предложение"}
          </div>

          <div className="flex items-center justify-between">

            <span className="text-primary font-semibold text-base">
              {formatPrice(promo.price)} {t("services.currency")}
            </span>

            <a
              href="/booking"
              onClick={() => {
                const until = Date.now() + HIDE_DURATION
                localStorage.setItem("promo_booked_until", String(until))
              }}
              className="text-xs font-medium text-primary hover:opacity-70 transition"
            >
              Записаться →
            </a>

          </div>

        </div>

      </motion.div>

    </AnimatePresence>

  )

}