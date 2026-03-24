// src/components/Footer.tsx

import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import { Phone, Mail, Send, Instagram, MapPin } from "lucide-react";
import { useState } from "react";

const Footer = () => {
  const { t } = useLanguage();

  // 🔥 state для modal
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);

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

                  {/* 🔥 PHONE → теперь button */}
                  <button
                    onClick={() => setIsPhoneOpen(true)}
                    className="flex items-center gap-3 group text-left"
                  >
                    <Phone size={16} className="opacity-60 group-hover:opacity-100 transition" />
                    <span className="group-hover:text-primary transition">
                      {t("footer.contacts.phone")}
                    </span>
                  </button>

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

          {/* MOBILE (НЕ ТРОГАЕМ) */}
          <div className="md:hidden flex flex-col items-center text-center">

            <h3 className="font-display text-2xl font-semibold mb-2">
              Karolina Beauty Room
            </h3>

            <p className="text-xs text-muted-foreground mb-6 max-w-xs">
              {t("footer.description")}
            </p>

            <div className="w-full flex flex-col gap-3 mb-6">

              <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3 bg-secondary/20">
                <div className="flex items-center gap-2 text-left">
                  <MapPin size={14} className="opacity-60" />
                  <div className="text-xs">
                    <div className="font-medium leading-none">Дружба</div>
                    <div className="text-muted-foreground text-[11px]">
                      +998 90 912 00 26
                    </div>
                  </div>
                </div>

                <a
                  href="tel:+998909120026"
                  className="text-xs px-3 py-1.5 rounded-full bg-primary text-white active:scale-[0.96] transition"
                >
                  {t("contacts.call")}
                </a>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3 bg-secondary/20">
                <div className="flex items-center gap-2 text-left">
                  <MapPin size={14} className="opacity-60" />
                  <div className="text-xs">
                    <div className="font-medium leading-none">Юнусабад</div>
                    <div className="text-muted-foreground text-[11px]">
                      +998 94 913 00 26
                    </div>
                  </div>
                </div>

                <a
                  href="tel:+998949130026"
                  className="text-xs px-3 py-1.5 rounded-full bg-primary text-white active:scale-[0.96] transition"
                >
                  {t("contacts.call")}
                </a>
              </div>

            </div>

            <div className="flex gap-3">
              <a href="https://t.me/radionkhusainov" target="_blank" rel="noopener noreferrer" className="w-11 h-11 flex items-center justify-center rounded-full border border-border bg-secondary/40">
                <Send size={18} />
              </a>

              <a href="https://instagram.com/karolinabeautyroom" target="_blank" rel="noopener noreferrer" className="w-11 h-11 flex items-center justify-center rounded-full border border-border bg-secondary/40">
                <Instagram size={18} />
              </a>

              <a href="mailto:info@karolinabeauty.uz" className="w-11 h-11 flex items-center justify-center rounded-full border border-border bg-secondary/40">
                <Mail size={18} />
              </a>
            </div>

          </div>

        </div>

      </div>

      {/* 🔥 MODAL (ТОЛЬКО ДЕСКТОП) */}
      {isPhoneOpen && (
        <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center">

          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsPhoneOpen(false)}
          />

          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl">

            <h3 className="font-display text-lg font-semibold text-center mb-6">
              {t("contacts.phone")}
            </h3>

            <div className="flex flex-col gap-4">

              <div className="flex items-center justify-between border border-border rounded-xl px-4 py-3">
                <div>
                  <div className="text-sm font-medium">Дружба</div>
                  <div className="text-xs text-muted-foreground">
                    +998 90 912 00 26
                  </div>
                </div>

                <a
                  href="tel:+998909120026"
                  className="text-xs px-3 py-1.5 rounded-full bg-primary text-white"
                >
                  {t("contacts.call")}
                </a>
              </div>

              <div className="flex items-center justify-between border border-border rounded-xl px-4 py-3">
                <div>
                  <div className="text-sm font-medium">Юнусабад</div>
                  <div className="text-xs text-muted-foreground">
                    +998 94 913 00 26
                  </div>
                </div>

                <a
                  href="tel:+998949130026"
                  className="text-xs px-3 py-1.5 rounded-full bg-primary text-white"
                >
                  {t("contacts.call")}
                </a>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* BOTTOM */}
      <div className="mt-8 border-t border-border">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">

          <a href="https://vantalab.uz" target="_blank" rel="noopener noreferrer">
            © {new Date().getFullYear()} by VantaLab. {t("footer.rights")}
          </a>

          <a href="https://vantalab.uz" target="_blank" rel="noopener noreferrer">
            {t("footer.developed")}
          </a>

        </div>
      </div>

    </footer>
  );
};

export default Footer;