
import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import Footer from "@/components/Footer"
import { useLanguage } from "@/i18n/LanguageContext"

const branches = [

  {
    nameKey: "branches.friendship",
    addressKey: "branches.friendship.address",
    landmarkKey: "branches.friendship.landmark",
    phone: "+998901234567",

    mapImage:
      "https://static-maps.yandex.ru/1.x/?ll=69.2045,41.2992&size=650,450&z=16&l=map&pt=69.2045,41.2992,pm2rdm",

    mapLink:
      "https://yandex.ru/maps/?text=Ташкент%20Фурката%2015/1"
  },

  {
    nameKey: "branches.yunusabad",
    addressKey: "branches.yunusabad.address",
    landmarkKey: "branches.yunusabad.landmark",
    phone: "+998901234567",

    mapImage:
      "https://static-maps.yandex.ru/1.x/?ll=69.2787,41.3612&size=650,450&z=16&l=map&pt=69.2787,41.3612,pm2rdm",

    mapLink:
      "https://yandex.ru/maps/?text=Ташкент%20Юнусабад%2014%20квартал%201"
  }

]

const Home = () => {

  const { t } = useLanguage()

  return (

    <div className="min-h-screen bg-background">

      <Navbar />

      <HeroSection />

      {/* POPULAR SERVICES */}

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

            {/* SERVICE */}

            <div className="bg-card p-7 md:p-8 rounded-3xl border border-border hover:shadow-xl transition flex flex-col">

              <h3 className="font-display text-xl mb-3">
                {t("home.popular.lashes.title")}
              </h3>

              <p className="text-muted-foreground text-sm mb-6 flex-grow">
                {t("home.popular.lashes.desc")}
              </p>

              <div className="text-primary font-semibold text-lg mb-6">
                200 000 {t("services.currency")}
              </div>

              <a
                href="/booking"
                className="inline-block text-center bg-primary text-white px-6 py-3 rounded-full text-sm font-medium"
              >
                {t("services.book")}
              </a>

            </div>


            <div className="bg-card p-7 md:p-8 rounded-3xl border border-border hover:shadow-xl transition flex flex-col">

              <h3 className="font-display text-xl mb-3">
                {t("home.popular.lamination.title")}
              </h3>

              <p className="text-muted-foreground text-sm mb-6 flex-grow">
                {t("home.popular.lamination.desc")}
              </p>

              <div className="text-primary font-semibold text-lg mb-6">
                100 000 {t("services.currency")}
              </div>

              <a
                href="/booking"
                className="inline-block text-center bg-primary text-white px-6 py-3 rounded-full text-sm font-medium"
              >
                {t("services.book")}
              </a>

            </div>


            <div className="bg-card p-7 md:p-8 rounded-3xl border border-border hover:shadow-xl transition flex flex-col">

              <h3 className="font-display text-xl mb-3">
                {t("home.popular.manicure.title")}
              </h3>

              <p className="text-muted-foreground text-sm mb-6 flex-grow">
                {t("home.popular.manicure.desc")}
              </p>

              <div className="text-primary font-semibold text-lg mb-6">
                170 000 {t("services.currency")}
              </div>

              <a
                href="/booking"
                className="inline-block text-center bg-primary text-white px-6 py-3 rounded-full text-sm font-medium"
              >
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

            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
              {t("home.locations.subtitle")}
            </p>

          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">

            {branches.map((branch) => (

              <div
                key={branch.nameKey}
                className="bg-card rounded-3xl overflow-hidden border border-border shadow-card"
              >

                <a
                  href={branch.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >

                  <img
                    src={branch.mapImage}
                    alt={t(branch.nameKey)}
                    className="w-full h-[240px] md:h-[340px] object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />

                </a>


                <div className="p-6 md:p-8">

                  <h3 className="font-display text-lg md:text-xl font-semibold mb-2">
                    {t(branch.nameKey)}
                  </h3>

                  <p className="text-sm mb-1">
                    {t(branch.addressKey)}
                  </p>

                  <p className="text-sm text-muted-foreground mb-4">
                    {t(branch.landmarkKey)}
                  </p>


                  <div className="text-muted-foreground text-sm space-y-1 mb-6">

                    <p>{t("home.locations.hours")}</p>

                    <p>{t("booking.weekdays")}</p>

                    <p>{t("booking.weekends")}</p>

                  </div>


                  <div className="flex flex-col sm:flex-row gap-3">

                    <a
                      href={branch.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-primary text-white px-5 py-3 rounded-full text-sm font-medium"
                    >
                      {t("home.locations.route")}
                    </a>

                    <a
                      href={`tel:${branch.phone}`}
                      className="flex-1 text-center border border-border px-5 py-3 rounded-full text-sm font-medium hover:bg-secondary"
                    >
                      {t("contacts.phone")}
                    </a>

                  </div>

                </div>

              </div>

            ))}


          </div>

        </div>

      </section>


      {/* FINAL CTA */}

      <section className="py-20 md:py-24">

        <div className="max-w-3xl mx-auto px-4 text-center">

          <h2 className="font-display text-3xl md:text-5xl font-semibold mb-6">
            {t("home.cta.title")}
          </h2>

          <p className="text-muted-foreground text-base md:text-lg mb-10">
            {t("home.cta.subtitle")}
          </p>

          <a
            href="/booking"
            className="inline-block bg-primary text-white px-8 md:px-10 py-4 rounded-full text-base md:text-lg font-medium hover:shadow-lg transition"
          >
            {t("hero.book")}
          </a>

        </div>

      </section>




      <Footer />

    </div>

  )
}

export default Home