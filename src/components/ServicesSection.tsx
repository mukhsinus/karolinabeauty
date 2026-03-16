// src/components/ServicesSection.tsx

import { useState } from "react"
import { useLanguage } from "@/i18n/LanguageContext"
import { serviceCategories } from "@/data/services"
import { motion } from "framer-motion"

const formatPrice = (price: number) => {
  return price.toLocaleString("ru-RU")
}

const ServicesSection = () => {

  const { t } = useLanguage()

  const [activeCategory, setActiveCategory] = useState(
    serviceCategories[0].id
  )

  const activeCat = serviceCategories.find(
    (c) => c.id === activeCategory
  )!

  return (

    <section id="services" className="py-32 bg-background">

      <div className="max-w-7xl mx-auto px-6">

        {/* TITLE */}

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

        <div className="flex flex-wrap justify-center gap-3 mb-20">

          {serviceCategories.map((cat) => (

            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-primary text-white shadow-lg"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >

              <span className="mr-2">
                {cat.icon}
              </span>

              {t(cat.nameKey)}

            </button>

          ))}

        </div>


        {/* GROUPS */}

        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-24"
        >

          {activeCat.groups.map((group) => (

            <div key={group.id}>

              {/* GROUP TITLE */}

              <h3 className="font-display text-2xl md:text-3xl font-semibold text-center mb-12">
                {t(group.titleKey)}
              </h3>


              {/* SERVICES GRID */}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

                {group.services.map((service, index) => (

                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}

                    className="group bg-card rounded-3xl p-8 border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                  >

                    {/* NAME */}

                    <p className="text-lg font-medium mb-8">
                      {t(service.nameKey)}
                    </p>

                    {/* PRICE */}

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

                      <a
                        href="/booking"
                        className="opacity-0 group-hover:opacity-100 transition text-sm font-medium text-primary"
                      >
                        {t("services.book")}
                      </a>

                    </div>

                  </motion.div>

                ))}

              </div>

            </div>

          ))}

        </motion.div>

      </div>

    </section>

  )
}

export default ServicesSection