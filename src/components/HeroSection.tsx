// src/components/HeroSection.tsx
import { useLanguage } from "@/i18n/LanguageContext"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import heroImage from "@/assets/hero-beauty.webp"
import heroImgMob from "@/assets/hero-mob.webp"

const HeroSection = () => {

  const { t } = useLanguage()
  const navigate = useNavigate()

  const goToBooking = () => {
    navigate("/booking")
  }

  const goToServices = () => {
    navigate("/services")
  }

  return (

    <section
      id="hero-section"
      className="hero-viewport hero-safe-area relative w-full flex items-stretch overflow-x-hidden"
    >

      {/* BACKGROUND */}

      <div className="absolute inset-0">

        <picture>
          {/* mobile */}
          <source
            srcSet={heroImgMob}
            media="(max-width: 768px)"
          />

          {/* desktop */}
          <img
            src={heroImage}
            alt={t("hero.alt")}
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="eager"
          />
        </picture>

        {/* cinematic dark overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* gradient depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      </div>


      {/* CONTENT */}

      <div className="relative z-10 w-full min-h-full flex flex-col justify-center">

        <div className="hero-mobile-content max-w-7xl mx-auto w-full px-6 pt-20 pb-10 sm:pt-24 sm:pb-12 md:py-0">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="max-w-2xl text-center md:text-left mx-auto md:mx-0"
          >

            {/* TITLE */}

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="font-display text-[clamp(2rem,9.5vw,2.65rem)] sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-4 sm:mb-6"
            >
              {t("hero.title")}
            </motion.h1>


            {/* SUBTITLE */}

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.8 }}
              className="text-white/80 text-base sm:text-lg md:text-xl font-light mb-7 sm:mb-10 max-w-xl"
            >
              {t("hero.tagline")}
            </motion.p>


            {/* BUTTONS */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            >

              {/* PRIMARY BUTTON */}

              <button
                onClick={goToBooking}
                aria-label={t("hero.book")}
                className="bg-primary text-white px-10 py-4 rounded-full text-base font-medium transition-all duration-300 hover:shadow-xl hover:scale-[1.03]"
              >
                {t("hero.book")}
              </button>


              {/* SECONDARY BUTTON */}

              <button
                onClick={goToServices}
                aria-label={t("hero.services")}
                className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-10 py-4 rounded-full text-base font-medium transition-all hover:bg-white/20"
              >
                {t("hero.services")}
              </button>

            </motion.div>

          </motion.div>

        </div>

      </div>

    </section>

  )

}

export default HeroSection