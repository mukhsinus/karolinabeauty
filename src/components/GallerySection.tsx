// src/components/GallerySection.tsx

import { useLanguage } from "@/i18n/LanguageContext"
import { motion } from "framer-motion"

import galleryLashes from "@/assets/gallery-lashes.jpg"
import galleryNails from "@/assets/gallery-nails.jpg"
import galleryBrows from "@/assets/gallery-brows.jpg"
import gallerySalon from "@/assets/gallery-salon.jpg"
import galleryDepilation from "@/assets/gallery-depilation.jpg"

const images = [
  { src: galleryLashes, alt: "Lash extensions" },
  { src: galleryNails, alt: "Nail art" },
  { src: galleryBrows, alt: "Brow styling" },
  { src: gallerySalon, alt: "Salon interior" },
  { src: galleryDepilation, alt: "Beauty treatments" },
]

const GallerySection = () => {

  const { t } = useLanguage()

  return (

    <section id="gallery" className="py-32 bg-background">

      <div className="max-w-7xl mx-auto px-6">

        {/* TITLE */}

        <motion.div

          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}

          viewport={{ once: true }}
          transition={{ duration: 0.6 }}

          className="text-center mb-24"
        >

          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-6">
            {t("gallery.title")}
          </h2>

          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {t("gallery.subtitle")}
          </p>

        </motion.div>


        {/* GALLERY GRID */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {images.map((img, i) => (

            <motion.div

              key={i}

              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}

              viewport={{ once: true }}

              transition={{
                duration: 0.6,
                delay: i * 0.1
              }}

              className="group relative overflow-hidden rounded-3xl shadow-card"
            >

              {/* IMAGE */}

              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-[420px] object-cover transition-transform duration-[800ms] group-hover:scale-110"
              />


              {/* DARK OVERLAY */}

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500" />


              {/* CAPTION */}

              <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">

                <div className="backdrop-blur-md bg-white/20 rounded-xl px-4 py-2 inline-block">

                  <p className="text-white text-sm font-medium">
                    {img.alt}
                  </p>

                </div>

              </div>

            </motion.div>

          ))}

        </div>


        {/* CTA */}

        <div className="text-center mt-24">

          <a
            href="/gallery"
            className="inline-block border border-primary text-primary px-10 py-4 rounded-full text-sm font-medium hover:bg-primary hover:text-white transition-all duration-300"
          >
            {t("gallery.view_all")}
          </a>

        </div>

      </div>

    </section>

  )

}

export default GallerySection