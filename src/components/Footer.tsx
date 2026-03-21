// src/components/Footer.tsx

import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import { Phone, Mail, Send, Instagram } from "lucide-react";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="relative mt-24">

      {/* TOP BLOCK */}
      <div className="container mx-auto px-4">

        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 md:p-12 shadow-sm">

          {/* Desktop */}
          <div className="hidden md:grid md:grid-cols-3 gap-12">

            {/* BRAND */}
            <div>
              <h3 className="font-display text-2xl font-semibold text-foreground mb-4">
                Karolina Beauty Room
              </h3>

              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                Премиальный салон красоты в Ташкенте. Маникюр, ресницы,
                брови и депиляция от профессиональных мастеров.
              </p>
            </div>

            {/* NAV */}
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-5 uppercase tracking-widest">
                Навигация
              </h4>

              <div className="flex flex-col gap-3 text-sm">

                <Link to="/" className="hover:text-primary transition">
                  {t("nav.home")}
                </Link>

                <Link to="/services" className="hover:text-primary transition">
                  {t("nav.services")}
                </Link>

                <Link to="/booking" className="hover:text-primary transition">
                  {t("nav.booking")}
                </Link>

                <Link to="/contacts" className="hover:text-primary transition">
                  {t("nav.contacts")}
                </Link>

              </div>
            </div>

            {/* CONTACTS */}
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-5 uppercase tracking-widest">
                Контакты
              </h4>

              <div className="flex flex-col gap-4 text-sm">

                <a
                  href="tel:+998931299955"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary group-hover:bg-primary/10 transition">
                    <Phone size={16} />
                  </div>
                  <span className="group-hover:text-primary transition">
                    +998 93 129 99 55
                  </span>
                </a>

                <a
                  href="mailto:info@karolinabeauty.uz"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary group-hover:bg-primary/10 transition">
                    <Mail size={16} />
                  </div>
                  <span className="group-hover:text-primary transition">
                    info@karolina.uz
                  </span>
                </a>

                <a
                  href="https://t.me/radionkhusainov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary group-hover:bg-primary/10 transition">
                    <Send size={16} />
                  </div>
                  <span className="group-hover:text-primary transition">
                    Telegram
                  </span>
                </a>

                <a
                  href="https://instagram.com/karolinabeautyroom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary group-hover:bg-primary/10 transition">
                    <Instagram size={16} />
                  </div>
                  <span className="group-hover:text-primary transition">
                    Instagram
                  </span>
                </a>

              </div>
            </div>

          </div>

          {/* MOBILE */}
          <div className="md:hidden text-center">

            <h3 className="font-display text-xl font-semibold mb-6">
              Karolina Beauty Room
            </h3>

            <div className="grid grid-cols-2 gap-4">

              {[
                {
                  icon: <Phone size={18} />,
                  label: "Phone",
                  href: "tel:+998931299955",
                },
                {
                  icon: <Mail size={18} />,
                  label: "Email",
                  href: "mailto:info@karolinabeauty.uz",
                },
                {
                  icon: <Send size={18} />,
                  label: "Telegram",
                  href: "https://t.me/radionkhusainov",
                },
                {
                  icon: <Instagram size={18} />,
                  label: "Instagram",
                  href: "https://instagram.com/karolinabeautyroom",
                },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-5 rounded-2xl bg-secondary/50 hover:bg-primary/10 active:scale-95 transition-all duration-200"
                >
                  <div className="text-foreground/80 group-hover:text-primary transition">
                    {item.icon}
                  </div>
                </a>
              ))}

            </div>

          </div>

        </div>

      </div>

      {/* BOTTOM */}

      <div className="mt-8 border-t border-border">

        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">

          <a
            href="https://vantalab.uz"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition"
          >
            © {new Date().getFullYear()} by VantaLab. {t("footer.rights")}
          </a>

          <a
            href="https://vantalab.uz"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-60 hover:opacity-100 hover:text-primary transition"
          >
            Developed with care
          </a>

        </div>

      </div>

    </footer>
  );
};

export default Footer;