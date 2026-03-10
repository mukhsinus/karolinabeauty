// src/components/GallerySection.tsx
import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import galleryLashes from "@/assets/gallery-lashes.jpg";
import galleryNails from "@/assets/gallery-nails.jpg";
import galleryBrows from "@/assets/gallery-brows.jpg";
import gallerySalon from "@/assets/gallery-salon.jpg";
import galleryDepilation from "@/assets/gallery-depilation.jpg";

const images = [
  { src: galleryLashes, alt: "Lash extensions" },
  { src: galleryNails, alt: "Nail art" },
  { src: galleryBrows, alt: "Brow styling" },
  { src: gallerySalon, alt: "Salon interior" },
  { src: galleryDepilation, alt: "Beauty treatments" },
];

const GallerySection = () => {
  const { t } = useLanguage();

  return (
    <section id="gallery" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
            {t("gallery.title")}
          </h2>
          <p className="text-muted-foreground text-lg font-light">
            {t("gallery.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="overflow-hidden rounded-2xl shadow-card group"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-72 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
