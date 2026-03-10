// src/components/ContactsSection.tsx
import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Instagram } from "lucide-react";

const ContactsSection = () => {
  const { t } = useLanguage();

  const items = [
    { icon: <MapPin size={20} />, label: t("contacts.address"), value: "Tashkent, Uzbekistan" },
    { icon: <Phone size={20} />, label: t("contacts.phone"), value: "+998 90 123 45 67" },
    { icon: <Instagram size={20} />, label: t("contacts.instagram"), value: "@beautystudio", href: "https://instagram.com/beautystudio" },
    { icon: <Clock size={20} />, label: t("contacts.working_hours"), value: `${t("booking.weekdays")}\n${t("booking.weekends")}` },
  ];

  return (
    <section id="contacts" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
            {t("contacts.title")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-8 shadow-card text-center"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                {item.icon}
              </div>
              <h4 className="font-display text-sm font-semibold text-foreground mb-2">
                {item.label}
              </h4>
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {item.value}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-line">{item.value}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactsSection;
