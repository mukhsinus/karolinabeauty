// src/components/StickyBookingButton.tsx

import { useLocation, useNavigate } from "react-router-dom"
import { useLanguage } from "@/i18n/LanguageContext"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const StickyBookingButton = () => {

  const { t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()

  const [show, setShow] = useState(false)

  // не показываем кнопку на странице записи
  if (location.pathname === "/booking") return null

  useEffect(() => {

    const hero = document.getElementById("hero-section")

    if (!hero) {
      setShow(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {

        // если hero в зоне видимости → кнопку скрываем
        if (entry.isIntersecting) {
          setShow(false)
        } else {
          setShow(true)
        }

      },
      {
        threshold: 0.1
      }
    )

    observer.observe(hero)

    return () => observer.disconnect()

  }, [])

  if (!show) return null

  return (

    <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 pointer-events-none">

      <motion.button

        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}

        transition={{ duration: 0.35 }}

        onClick={() => navigate("/booking")}

        className="pointer-events-auto w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold shadow-xl backdrop-blur-lg active:scale-[0.98] transition"
      >

        {t("hero.book")}

      </motion.button>

    </div>

  )

}

export default StickyBookingButton