// src/pages/Home.tsx

import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import Footer from "@/components/Footer"
import { useLanguage } from "@/i18n/LanguageContext"
import { useBranches } from "@/hooks/useBranches"

const Home = () => {
  const { t, lang } = useLanguage()
  const { data: branches } = useBranches()

  // 🌍 i18n-safe названия филиалов
  const branchNamesMap: Record<string, string> = {
    "Чиланзар": t("branches.friendship"),
    "Юнусабад": t("branches.yunusabad"),
  }

  // 📍 координаты
  const coordsByName: Record<string, { lat: number; lng: number }> = {
    "Чиланзар": {
      lat: 41.3095113,
      lng: 69.2432072
    },
    "Юнусабад": {
      lat: 41.3731212,
      lng: 69.2955703
    }
  }

  // 📞 ЖЁСТКО заданные номера (без i18n)
  const phonesByName: Record<string, string> = {
    "Чиланзар": "+998909120026",
    "Юнусабад": "+998949130026",
  }

  const DEFAULT_COORDS = {
    lat: 41.311081,
    lng: 69.240562
  }

  const formatPrice = (price: number) => {
    if (!price) return "-"
    return price.toLocaleString(
      lang === "uz" ? "uz-UZ" : lang === "en" ? "en-US" : "ru-RU"
    )
  }

  const getStaticMap = (lat: number, lng: number) =>
    `https://static-maps.yandex.ru/1.x/?ll=${lng},${lat}&z=17&size=650,300&l=map&pt=${lng},${lat},pm2rdl`

  const openRoute = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    window.location.href = url
  }

  const normalizePhone = (phone: string) =>
    phone.replace(/[^\d+]/g, "")

  // 🔥 универсальный подбор номера (устойчивый к любым названиям)
  const getPhone = (name: string) => {
    const n = name.toLowerCase()

    if (n.includes("чилан") || n.includes("друж"))
      return phonesByName["Чиланзар"]

    if (n.includes("юнус"))
      return phonesByName["Юнусабад"]

    return ""
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />

      {/* POPULAR SERVICES */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">

          <div className="text-center mb-14 md:mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4">
              {t("home.popular.title")}
            </h2>

            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
              {t("home.popular.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

            {/* CARD 1 */}
            <div className="bg-card p-7 rounded-3xl border flex flex-col">
              <h3 className="font-display text-xl mb-3">
                {t("home.popular.lashes.title")}
              </h3>
              <p className="text-muted-foreground text-sm mb-6 flex-grow">
                {t("home.popular.lashes.desc")}
              </p>
              <div className="text-primary font-semibold text-lg mb-6">
                {formatPrice(200000)} {t("services.currency")}
              </div>
              <a href="/booking" className="bg-primary text-white px-6 py-3 rounded-full text-center">
                {t("services.book")}
              </a>
            </div>

            {/* CARD 2 */}
            <div className="bg-card p-7 rounded-3xl border flex flex-col">
              <h3 className="font-display text-xl mb-3">
                {t("home.popular.lamination.title")}
              </h3>
              <p className="text-muted-foreground text-sm mb-6 flex-grow">
                {t("home.popular.lamination.desc")}
              </p>
              <div className="text-primary font-semibold text-lg mb-6">
                {formatPrice(100000)} {t("services.currency")}
              </div>
              <a href="/booking" className="bg-primary text-white px-6 py-3 rounded-full text-center">
                {t("services.book")}
              </a>
            </div>

            {/* CARD 3 */}
            <div className="bg-card p-7 rounded-3xl border flex flex-col">
              <h3 className="font-display text-xl mb-3">
                {t("home.popular.manicure.title")}
              </h3>
              <p className="text-muted-foreground text-sm mb-6 flex-grow">
                {t("home.popular.manicure.desc")}
              </p>
              <div className="text-primary font-semibold text-lg mb-6">
                {formatPrice(250000)} {t("services.currency")}
              </div>
              <a href="/booking" className="bg-primary text-white px-6 py-3 rounded-full text-center">
                {t("services.book")}
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* LOCATIONS */}
      <section className="py-20 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-6">

          <div className="text-center mb-14 md:mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4">
              {t("home.locations.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {branches?.map((branch) => {

              const coords =
                coordsByName[branch.name] || DEFAULT_COORDS

              const rawPhone = getPhone(branch.name)
              const phone = normalizePhone(rawPhone)

              return (
                <div
                  key={branch._id}
                  className="bg-card rounded-3xl overflow-hidden border shadow-card"
                >

                  <div
                    onClick={() => openRoute(coords.lat, coords.lng)}
                    className="cursor-pointer"
                  >
                    <img
                      src={getStaticMap(coords.lat, coords.lng)}
                      alt={t("home.locations.map_alt")}
                      className="w-full h-[240px] md:h-[320px] object-cover"
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="font-display text-lg font-semibold mb-2">
                      {branchNamesMap[branch.name] || branch.name}
                    </h3>

                    <p className="text-sm mb-4">
                      {branch.address}
                    </p>

                    <button
                      onClick={() => openRoute(coords.lat, coords.lng)}
                      className="w-full bg-primary text-white py-3 rounded-full text-sm mb-3"
                    >
                      {t("home.locations.route")}
                    </button>

                    <a
                      href={`tel:${phone}`}
                      className="block text-center border px-5 py-3 rounded-full text-sm hover:bg-secondary"
                    >
                      {t("contacts.phone")}
                    </a>
                  </div>

                </div>
              )
            })}

          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home