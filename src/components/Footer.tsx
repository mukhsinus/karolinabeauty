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

          <div className="hidden md:block h-px bg-gradient-to-r from-transparent via-border to-transparent mb-10" />

          {/* DESKTOP */}
          <div className="hidden md:grid md:grid-cols-[1.2fr_0.8fr_1fr] gap-20 items-start">

            {/* BRAND */}
            <div className="max-w-sm flex flex-col justify-between h-full">

              <div>
                <h3 className="font-display text-3xl leading-tight tracking-tight mb-6">
                  Karolina Beauty Room
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t("footer.description")}
                </p>
              </div>

            </div>

            {/* NAV */}
            <div className="flex flex-col justify-between h-full">

              <div>
                <h4 className="text-[11px] tracking-[0.2em] text-muted-foreground mb-6 uppercase">
                  {t("footer.navigation")}
                </h4>

                <div className="flex flex-col gap-4 text-sm">

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

            </div>

            {/* CONTACTS */}
            <div className="flex flex-col justify-between h-full">

              <div>
                <h4 className="text-[11px] tracking-[0.2em] text-muted-foreground mb-6 uppercase">
                  {t("footer.contacts")}
                </h4>

                <div className="flex flex-col gap-5 text-sm">

                  <a
                    href="tel:+998931299955"
                    className="flex items-center gap-3 group"
                  >
                    <Phone size={16} className="opacity-60 group-hover:opacity-100 transition" />
                    <span className="group-hover:text-primary transition">
                      {t("footer.contacts.phone")}
                    </span>
                  </a>

                  <a
                    href="mailto:info@karolinabeauty.uz"
                    className="flex items-center gap-3 group"
                  >
                    <Mail size={16} className="opacity-60 group-hover:opacity-100 transition" />
                    <span className="group-hover:text-primary transition">
                      {t("footer.contacts.email")}
                    </span>
                  </a>

                  <a
                    href="https://t.me/radionkhusainov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group"
                  >
                    <Send size={16} className="opacity-60 group-hover:opacity-100 transition" />
                    <span className="group-hover:text-primary transition">
                      {t("footer.contacts.telegram")}
                    </span>
                  </a>

                  <a
                    href="https://instagram.com/karolinabeautyroom"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group"
                  >
                    <Instagram size={16} className="opacity-60 group-hover:opacity-100 transition" />
                    <span className="group-hover:text-primary transition">
                      {t("footer.contacts.instagram")}
                    </span>
                  </a>

                </div>
              </div>

            </div>

          </div>

          {/* MOBILE */}
          <div className="md:hidden flex flex-col items-center text-center">

            {/* BRAND */}
            <h3 className="font-display text-2xl font-semibold mb-2">
              Karolina Beauty Room
            </h3>

            <p className="text-xs text-muted-foreground mb-8 max-w-xs">
              {t("footer.description")}
            </p>

            {/* PRIMARY ACTIONS */}
            <div className="w-full flex flex-col gap-3 mb-6">

              <a
                href="tel:+998931299955"
                className="flex items-center justify-center gap-2 py-4 rounded-full bg-primary text-white font-medium text-sm active:scale-[0.98] transition"
              >
                <Phone size={16} />
                {t("contacts.phone")}
              </a>

              <a
                href="mailto:info@karolinabeauty.uz"
                className="flex items-center justify-center gap-2 py-4 rounded-full border border-border text-sm active:scale-[0.98] transition"
              >
                <Mail size={16} />
                Email
              </a>

            </div>

            {/* SOCIALS */}
            <div className="flex gap-3">

              <a
                href="https://t.me/radionkhusainov"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center rounded-full border border-border bg-secondary/40 active:scale-[0.95] transition"
              >
                <Send size={18} />
              </a>

              <a
                href="https://instagram.com/karolinabeautyroom"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center rounded-full border border-border bg-secondary/40 active:scale-[0.95] transition"
              >
                <Instagram size={18} />
              </a>

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
            {t("footer.developed")}
          </a>

        </div>

      </div>

    </footer>
  );
};

export default Footer;