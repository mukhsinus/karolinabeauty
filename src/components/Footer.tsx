// src/components/Footer.tsx

import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import { Phone, Mail, Send, Instagram } from "lucide-react";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border">

      <div className="container mx-auto px-4 py-12 md:py-16">

        {/* Desktop layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-12">

          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl font-semibold text-foreground mb-4">
              Karolina Beauty
            </h3>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Премиальный салон красоты в Ташкенте. Маникюр, ресницы,
              брови и депиляция от профессиональных мастеров.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
              Навигация
            </h4>

            <div className="flex flex-col gap-3 text-sm">

              <Link
                to="/"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {t("nav.home")}
              </Link>

              <Link
                to="/services"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {t("nav.services")}
              </Link>

              <Link
                to="/gallery"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {t("nav.gallery")}
              </Link>

              <Link
                to="/booking"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {t("nav.booking")}
              </Link>

              <Link
                to="/contacts"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {t("nav.contacts")}
              </Link>

            </div>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-display text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
              Контакты
            </h4>

            <div className="flex flex-col gap-4 text-sm">

              <a
                href="tel:+998901234567"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone size={16} />
                +998 90 123 45 67
              </a>

              <a
                href="mailto:info@karolinabeauty.uz"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail size={16} />
                info@karolina.uz
              </a>

              <a
                href="https://t.me/karolinabeauty"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <Send size={16} />
                Telegram
              </a>

              <a
                href="https://instagram.com/karolinabeauty"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram size={16} />
                Instagram
              </a>

            </div>
          </div>

        </div>

        {/* Mobile layout */}
        <div className="md:hidden">

          <h3 className="font-display text-xl font-semibold text-foreground mb-6">
            Karolina Beauty
          </h3>

          <div className="grid grid-cols-2 gap-y-5 gap-x-6 text-sm">

            <a
              href="tel:+998901234567"
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Phone size={18} />
              +998901234567
            </a>

            <a
              href="mailto:info@karolinabeauty.uz"
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Mail size={18} />
              Email
            </a>

            <a
              href="https://t.me/karolinabeauty"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Send size={18} />
              Telegram
            </a>

            <a
              href="https://instagram.com/karolinabeauty"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Instagram size={18} />
              Instagram
            </a>

          </div>

        </div>

      </div>

      {/* Bottom bar */}

      <div className="border-t border-border">

        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">

          <p>
            © {new Date().getFullYear()} Karolina Beauty Studio. {t("footer.rights")}
          </p>

          <a
            href="https://vantalab.uz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs opacity-70 hover:opacity-100 hover:text-primary transition-all underline-offset-4 hover:underline"
          >
            Developed with care
          </a>

        </div>

      </div>

    </footer>
  );
};

export default Footer;