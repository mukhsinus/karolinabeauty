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

        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 md:p-10 shadow-sm">

          {/* subtle divider */}
          <div className="hidden md:block h-px bg-gradient-to-r from-transparent via-border to-transparent mb-10" />

          {/* Desktop */}
          <div className="hidden md:grid md:grid-cols-3 gap-16">

            {/* BRAND */}
            <div className="max-w-sm">

              <h3 className="font-display text-3xl leading-tight tracking-tight mb-6">
                Karolina Beauty Room
              </h3>

              <p className="text-muted-foreground text-sm leading-relaxed">
                Премиальный салон красоты в Ташкенте. Маникюр, ресницы,
                брови и депиляция от профессиональных мастеров.
              </p>

            </div>

            {/* NAV */}
            <div>

              <h4 className="text-[11px] tracking-[0.2em] text-muted-foreground mb-6 uppercase">
                Навигация
              </h4>

              <div className="flex flex-col gap-4 text-sm">

                <Link to="/" className="hover:text-primary transition-colors">
                  {t("nav.home")}
                </Link>

                <Link to="/services" className="hover:text-primary transition-colors">
                  {t("nav.services")}
                </Link>

                <Link to="/booking" className="hover:text-primary transition-colors">
                  {t("nav.booking")}
                </Link>

                <Link to="/contacts" className="hover:text-primary transition-colors">
                  {t("nav.contacts")}
                </Link>

              </div>

            </div>

            {/* CONTACTS */}
            <div>

              <h4 className="text-[11px] tracking-[0.2em] text-muted-foreground mb-6 uppercase">
                Контакты
              </h4>

              <div className="flex flex-col gap-3">

                <a
                  href="tel:+998931299955"
                  className="flex items-center gap-3 px-4 py-3 rounded-full bg-secondary/40 hover:bg-primary/10 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-background border border-border">
                    <Phone size={14} />
                  </div>

                  <span className="text-sm group-hover:text-primary transition">
                    +998 93 129 99 55
                  </span>
                </a>

                <a
                  href="mailto:info@karolinabeauty.uz"
                  className="flex items-center gap-3 px-4 py-3 rounded-full bg-secondary/40 hover:bg-primary/10 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-background border border-border">
                    <Mail size={14} />
                  </div>

                  <span className="text-sm group-hover:text-primary transition">
                    info@karolina.uz
                  </span>
                </a>

                <a
                  href="https://t.me/radionkhusainov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-full bg-secondary/40 hover:bg-primary/10 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-background border border-border">
                    <Send size={14} />
                  </div>

                  <span className="text-sm group-hover:text-primary transition">
                    Telegram
                  </span>
                </a>

                <a
                  href="https://instagram.com/karolinabeautyroom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-full bg-secondary/40 hover:bg-primary/10 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-background border border-border">
                    <Instagram size={14} />
                  </div>

                  <span className="text-sm group-hover:text-primary transition">
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
                  href: "tel:+998931299955",
                },
                {
                  icon: <Mail size={18} />,
                  href: "mailto:info@karolinabeauty.uz",
                },
                {
                  icon: <Send size={18} />,
                  href: "https://t.me/radionkhusainov",
                },
                {
                  icon: <Instagram size={18} />,
                  href: "https://instagram.com/karolinabeautyroom",
                },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-5 rounded-2xl bg-secondary/50 hover:bg-primary/10 active:scale-95 transition-all duration-200"
                >
                  <div className="text-foreground/80">
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