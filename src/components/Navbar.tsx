import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Lang } from "@/i18n/translations";
import { Menu, X } from "lucide-react";

const langs: { code: Lang; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "uz", label: "UZ" },
  { code: "en", label: "EN" },
];

const Navbar = () => {
  const { t, lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { key: "nav.home", href: "#home" },
    { key: "nav.services", href: "#services" },
    { key: "nav.gallery", href: "#gallery" },
    { key: "nav.booking", href: "#booking" },
    { key: "nav.contacts", href: "#contacts" },
  ];

  const scrollTo = (href: string) => {
    setIsOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <a href="#home" className="font-display text-xl font-semibold text-foreground tracking-wide">
          Karolina Beauty Studio
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => scrollTo(item.href)}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {t(item.key)}
            </button>
          ))}
        </div>

        {/* Language switcher */}
        <div className="hidden md:flex items-center gap-1 bg-secondary rounded-full px-1 py-0.5">
          {langs.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                lang === l.code
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 pb-4 animate-fade-in">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => scrollTo(item.href)}
              className="block w-full text-left py-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {t(item.key)}
            </button>
          ))}
          <div className="flex items-center gap-1 mt-3 bg-secondary rounded-full px-1 py-0.5 w-fit">
            {langs.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  lang === l.code
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
