// src/components/ContactsSection.tsx

import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Instagram } from "lucide-react";

const ContactsSection = () => {
  const { t } = useLanguage();

  const items = [
    {
      icon: <MapPin size={20} />,
      label: t("branches.friendship"),
      value: `${t("branches.friendship")}\n${t("branches.friendship.address")}`,
      href: "https://maps.google.com/?q=Furkat+15/1+Tashkent"
    },

    {
      icon: <MapPin size={20} />,
      label: t("branches.yunusabad"),
      value: `${t("branches.yunusabad")}\n${t("branches.yunusabad.address")}`,
      href: "https://maps.google.com/?q=Yunusabad+14+kvartal+1+dom"
    }
  ];

  const secondaryItems = [
    {
      icon: <Instagram size={20} />,
      label: t("contacts.instagram"),
      value: t("contacts.instagram.value"),
      href: t("contacts.instagram.url")
    },

    {
      icon: <Clock size={20} />,
      label: t("contacts.working_hours"),
      value: `${t("booking.weekdays")}\n${t("booking.weekends")}`
    }
  ];

  return (
    <section id="contacts" className="py-24">
      <div className="container mx-auto px-4">

        {/* TITLE */}
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

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">

          {/* MAP CARDS */}
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-8 shadow-card text-center transition hover:-translate-y-1 hover:shadow-xl"
            >

              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                {item.icon}
              </div>

              <h4 className="font-display text-sm font-semibold text-foreground mb-2">
                {item.label}
              </h4>

              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline whitespace-pre-line"
              >
                {item.value}
              </a>

            </motion.div>
          ))}

          {/* 🔥 PHONE CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-8 shadow-card text-center transition hover:-translate-y-1 hover:shadow-xl"
          >

            {/* ICON */}
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <Phone size={20} />
            </div>

            {/* TITLE */}
            <h4 className="font-display text-sm font-semibold text-foreground mb-4">
              {t("contacts.phone")}
            </h4>

            {/* CONTENT */}
            <div className="flex flex-col gap-4 items-center">

              {/* Дружба */}
              <div className="text-center">
                <div className="font-medium text-sm">
                  {t("branches.friendship")}
                </div>

                <a
                  href="tel:+998909120026"
                  className="text-sm text-muted-foreground hover:text-primary transition"
                >
                  +998 90 912 00 26
                </a>
              </div>

              {/* Юнусабад */}
              <div className="text-center">
                <div className="font-medium text-sm">
                  {t("branches.yunusabad")}
                </div>

                <a
                  href="tel:+998949130026"
                  className="text-sm text-muted-foreground hover:text-primary transition"
                >
                  +998 94 913 00 26
                </a>
              </div>

            </div>

          </motion.div>

          {/* OTHER CARDS */}
          {secondaryItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i + 3) * 0.1 }}
              className="bg-card rounded-2xl p-8 shadow-card text-center transition hover:-translate-y-1 hover:shadow-xl"
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
                  className="text-sm text-primary hover:underline whitespace-pre-line"
                >
                  {item.value}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {item.value}
                </p>
              )}

            </motion.div>
          ))}

        </div>

      </div>
    </section>
  );
};

export default ContactsSection;