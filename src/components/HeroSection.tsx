// src/components/HeroSection.tsx

import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-beauty.jpg";

const HeroSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const goToBooking = () => {
    navigate("/booking");
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Karolina Beauty Studio"
          className="w-full h-full object-cover"
          loading="eager"
        />

        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/10" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            {t("hero.title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-white/80 mb-10 font-body font-light tracking-wide max-w-lg"
          >
            {t("hero.tagline")}
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            onClick={goToBooking}
            className="bg-primary text-primary-foreground px-10 py-4 rounded-full text-base font-medium transition-all duration-300 hover:shadow-elevated hover:scale-105"
          >
            {t("hero.book")}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;