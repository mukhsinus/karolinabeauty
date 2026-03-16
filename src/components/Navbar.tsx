// src/components/Navbar.tsx

import { useState, useEffect } from "react"
import { useLanguage } from "@/i18n/LanguageContext"
import { Lang } from "@/i18n/translations"
import { Menu, X } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

const langs: { code: Lang; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "uz", label: "UZ" },
  { code: "en", label: "EN" },
]

const Navbar = () => {

  const { t, lang, setLang } = useLanguage()

  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const location = useLocation()

  const isHome = location.pathname === "/"
  const isHeroTop = isHome && !scrolled

  const navItems = [
    { key: "nav.home", href: "/" },
    { key: "nav.services", href: "/services" },
    { key: "nav.gallery", href: "/gallery" },
    { key: "nav.booking", href: "/booking" },
    { key: "nav.contacts", href: "/contacts" },
  ]

  useEffect(() => {

    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }

    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)

  }, [])

  const closeMobile = () => setIsOpen(false)

  return (

    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/70 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >

      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* LOGO */}

        <NavLink
          to="/"
          className={`font-display text-xl font-semibold tracking-wide transition-colors ${
            isHeroTop ? "text-white" : "text-foreground"
          }`}
        >
          Karolina Beauty Studio
        </NavLink>


        {/* DESKTOP NAV */}

        <div className="hidden md:flex items-center gap-10">

          {navItems.map((item) => (

            <NavLink
              key={item.key}
              to={item.href}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors relative ${
                  isActive
                    ? "text-primary"
                    : isHeroTop
                    ? "text-white/90 hover:text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {t(item.key)}
            </NavLink>

          ))}

        </div>


        {/* RIGHT SIDE */}

        <div className="flex items-center gap-4">

          {/* LANGUAGE SWITCHER */}

          <div className="hidden md:flex items-center gap-1 bg-secondary/70 backdrop-blur-sm rounded-full px-1 py-0.5">

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


          {/* MOBILE BUTTON */}

          <button
            className={`md:hidden transition-colors ${
              isHeroTop ? "text-white" : "text-foreground"
            }`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

        </div>

      </div>


      {/* MOBILE MENU */}

      {isOpen && (

        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-border px-6 pb-6 animate-fade-in">

          <div className="flex flex-col pt-4">

            {navItems.map((item) => (

              <NavLink
                key={item.key}
                to={item.href}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `py-3 text-base font-medium transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {t(item.key)}
              </NavLink>

            ))}

          </div>


          {/* LANGUAGE MOBILE */}

          <div className="flex items-center gap-1 mt-4 bg-secondary rounded-full px-1 py-0.5 w-fit">

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

  )

}

export default Navbar