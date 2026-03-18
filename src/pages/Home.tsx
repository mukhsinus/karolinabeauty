// src/pages/Home.tsx
import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import Footer from "@/components/Footer"
import { useLanguage } from "@/i18n/LanguageContext"
import { useBranches } from "@/hooks/useBranches"

const Home = () => {

  const { t } = useLanguage()
  const { data: branches } = useBranches()

  // 🔥 МАПА ДЛЯ ПЕРЕИМЕНОВАНИЯ ФИЛИАЛОВ
  const branchNamesMap: Record<string, string> = {
    "Чиланзар": "Филиал Дружба Народов",
    "Юнусабад": "Филиал Юнусабад"
  }

  const coordsMap: Record<string, { lat: number; lng: number }> = {
    "Метро Дружба Народов, Фурката 15/1": {
      lat: 41.303216,
      lng: 69.242998
    },
    "Юнусабад 14 квартал, дом 1": {
      lat: 41.366981,
      lng: 69.288563
    }
  }

  const getStaticMap = (lat: number, lng: number) =>
    `https://static-maps.yandex.ru/1.x/?ll=${lng},${lat}&z=16&size=650,300&l=map&pt=${lng},${lat},pm2rdm`

  const getYandexRoute = (lat: number, lng: number) =>
    `https://yandex.ru/maps/?rtext=~${lat},${lng}`

  const getGoogleRoute = (lat: number, lng: number) =>
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

  const openRoute = (lat: number, lng: number) => {
    const win = window.open(getYandexRoute(lat, lng), "_blank")

    setTimeout(() => {
      if (!win || win.closed) {
        window.open(getGoogleRoute(lat, lng), "_blank")
      }
    }, 700)
  }

  return (

    <div className="min-h-screen bg-background">

      <Navbar />
      <HeroSection />

      {/* 🔥 POPULAR SERVICES (НЕ ТРОГАЛ) */}

      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center mb-14 md:mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4">
              {t("home.popular.title")}
            </h2>

            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
              {t("home.popular.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

            <div className="bg-card p-7 rounded-3xl border flex flex-col">
              <h3 className="font-display text-xl mb-3">
                {t("home.popular.lashes.title")}
              </h3>
              <p className="text-muted-foreground text-sm mb-6 flex-grow">
                {t("home.popular.lashes.desc")}
              </p>
              <div className="text-primary font-semibold text-lg mb-6">
                200 000 {t("services.currency")}
              </div>
              <a href="/booking" className="bg-primary text-white px-6 py-3 rounded-full text-center">
                {t("services.book")}
              </a>
            </div>

            <div className="bg-card p-7 rounded-3xl border flex flex-col">
              <h3 className="font-display text-xl mb-3">
                {t("home.popular.lamination.title")}
              </h3>
              <p className="text-muted-foreground text-sm mb-6 flex-grow">
                {t("home.popular.lamination.desc")}
              </p>
              <div className="text-primary font-semibold text-lg mb-6">
                100 000 {t("services.currency")}
              </div>
              <a href="/booking" className="bg-primary text-white px-6 py-3 rounded-full text-center">
                {t("services.book")}
              </a>
            </div>

            <div className="bg-card p-7 rounded-3xl border flex flex-col">
              <h3 className="font-display text-xl mb-3">
                {t("home.popular.manicure.title")}
              </h3>
              <p className="text-muted-foreground text-sm mb-6 flex-grow">
                {t("home.popular.manicure.desc")}
              </p>
              <div className="text-primary font-semibold text-lg mb-6">
                170 000 {t("services.currency")}
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
        <div className="max-w-6xl mx-auto px-4">

          <div className="text-center mb-14 md:mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4">
              {t("home.locations.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {branches?.map((branch) => {

              const coords = coordsMap[branch.address]
              if (!coords) return null

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
                      alt={branch.name}
                      className="w-full h-[240px] md:h-[320px] object-cover"
                    />
                  </div>

                  <div className="p-6">

                    {/* ✅ ВОТ ЭТО МЫ ИЗМЕНИЛИ */}
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
                      Проложить маршрут
                    </button>

                    <a
                      href={`tel:${branch.phone}`}
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