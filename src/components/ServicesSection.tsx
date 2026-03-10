// src/components/ServicesSection.tsx
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { serviceCategories } from "@/data/services";
import { motion } from "framer-motion";

const formatPrice = (price: number) => {
  return price.toLocaleString("ru-RU");
};

const ServicesSection = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState(serviceCategories[0].id);

  const activeCat = serviceCategories.find((c) => c.id === activeCategory)!;

  return (
    <section id="services" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
            {t("services.title")}
          </h2>
          <p className="text-muted-foreground text-lg font-light max-w-md mx-auto">
            {t("services.subtitle")}
          </p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {serviceCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-card text-muted-foreground hover:text-foreground shadow-card"
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {t(cat.nameKey)}
            </button>
          ))}
        </div>

        {/* Services grid */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto"
        >
          {activeCat.services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <p className="text-sm font-medium text-foreground mb-3">
                {t(service.nameKey)}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-primary font-semibold text-lg">
                  {service.isFrom && (
                    <span className="text-muted-foreground text-sm font-normal mr-1">
                      {t("services.from")}
                    </span>
                  )}
                  {formatPrice(service.price)}{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    {t("services.currency")}
                  </span>
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
