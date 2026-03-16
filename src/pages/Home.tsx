// src/pages/Home.tsx

import StickyBookingButton from "@/components/StickyBookingButton"
import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import Footer from "@/components/Footer"

const branches = [
  {
    name: "Юнусабад 13 квартал",
    mapImage:
      "https://static-maps.yandex.ru/1.x/?ll=69.2787,41.3612&size=650,450&z=15&l=map&pt=69.2787,41.3612,pm2rdm",
    mapLink:
      "https://yandex.ru/maps/?rtext=~41.3612,69.2787&rtt=auto",
  },
  {
    name: "Метро Дружба Народов",
    mapImage:
      "https://static-maps.yandex.ru/1.x/?ll=69.2045,41.2992&size=650,450&z=15&l=map&pt=69.2045,41.2992,pm2rdm",
    mapLink:
      "https://yandex.ru/maps/?rtext=~41.2992,69.2045&rtt=auto",
  },
]

const Home = () => {
  return (
    <div className="min-h-screen bg-background">

      <Navbar />

      {/* HERO */}

      <HeroSection />

      {/* POPULAR SERVICES */}

      <section className="py-24">

        <div className="container mx-auto px-4 max-w-7xl">

          <div className="text-center mb-16">

            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
              Популярные услуги
            </h2>

            <p className="text-muted-foreground text-lg">
              Самые востребованные процедуры наших клиентов
            </p>

          </div>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-card p-8 rounded-3xl border border-border hover:shadow-xl transition-all">

              <h3 className="font-display text-xl mb-3">
                Классическое наращивание
              </h3>

              <p className="text-muted-foreground text-sm mb-6">
                Натуральный эффект, идеальный объём и долговечный результат
              </p>

              <div className="text-primary font-semibold text-lg mb-6">
                200 000 сум
              </div>

              <a
                href="/booking"
                className="inline-block bg-primary text-white px-6 py-3 rounded-full text-sm font-medium"
              >
                Записаться
              </a>

            </div>

            <div className="bg-card p-8 rounded-3xl border border-border hover:shadow-xl transition-all">

              <h3 className="font-display text-xl mb-3">
                Ламинирование ресниц
              </h3>

              <p className="text-muted-foreground text-sm mb-6">
                Подчёркнутый изгиб и питание ресниц
              </p>

              <div className="text-primary font-semibold text-lg mb-6">
                100 000 сум
              </div>

              <a
                href="/booking"
                className="inline-block bg-primary text-white px-6 py-3 rounded-full text-sm font-medium"
              >
                Записаться
              </a>

            </div>

            <div className="bg-card p-8 rounded-3xl border border-border hover:shadow-xl transition-all">

              <h3 className="font-display text-xl mb-3">
                Маникюр + покрытие
              </h3>

              <p className="text-muted-foreground text-sm mb-6">
                Идеальная форма и стойкое покрытие
              </p>

              <div className="text-primary font-semibold text-lg mb-6">
                170 000 сум
              </div>

              <a
                href="/booking"
                className="inline-block bg-primary text-white px-6 py-3 rounded-full text-sm font-medium"
              >
                Записаться
              </a>

            </div>

          </div>

        </div>

      </section>

      {/* LOCATIONS */}

      <section className="py-24 bg-secondary/30">

        <div className="container mx-auto px-4">

          <div className="text-center mb-16">

            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
              Наши салоны
            </h2>

            <p className="text-muted-foreground text-lg">
              Выберите ближайший салон и постройте маршрут
            </p>

          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">

            {branches.map((branch) => (

              <div
                key={branch.name}
                className="bg-card rounded-3xl shadow-card overflow-hidden border border-border"
              >

                <a
                  href={branch.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >

                  <img
                    src={branch.mapImage}
                    alt={branch.name}
                    className="w-full h-[360px] object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />

                </a>

                <div className="p-8">

                  <h3 className="font-display text-xl font-semibold mb-3">
                    {branch.name}
                  </h3>

                  <div className="text-muted-foreground text-sm space-y-1">

                    <p>График работы</p>

                    <p>Пн–Пт: 09:00 — 21:00</p>

                    <p>Сб–Вс: 10:00 — 22:00</p>

                  </div>

                  <a
                    href={branch.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-6 text-sm font-medium text-primary hover:underline"
                  >
                    Построить маршрут
                  </a>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* FINAL CTA */}

      <section className="py-24">

        <div className="container mx-auto px-4 text-center max-w-3xl">

          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-6">
            Готовы к идеальному образу?
          </h2>

          <p className="text-muted-foreground text-lg mb-10">
            Запишитесь на процедуру прямо сейчас и доверьте свою красоту профессионалам Karolina Beauty
          </p>

          <a
            href="/booking"
            className="inline-block bg-primary text-white px-10 py-4 rounded-full text-lg font-medium hover:shadow-lg transition"
          >
            Записаться онлайн
          </a>

        </div>

      </section>

      <StickyBookingButton />

      <Footer />

    </div>
  )
}

export default Home