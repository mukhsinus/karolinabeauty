// src/pages/Home.tsx

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import Footer from "@/components/Footer";

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
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background">

      <Navbar />

      {/* Hero */}
      <HeroSection />

      {/* Services preview */}
      <ServicesSection />

      {/* Location + Working hours */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">

          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
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
                className="bg-card rounded-2xl shadow-card overflow-hidden"
              >

                {/* Static map */}
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

                {/* Info */}
                <div className="p-6">

                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                    {branch.name}
                  </h3>

                  <div className="text-muted-foreground text-sm space-y-1">

                    <p>
                      График работы
                    </p>

                    <p>
                      Пн–Пт: 09:00 — 21:00
                    </p>

                    <p>
                      Сб–Вс: 10:00 — 22:00
                    </p>

                  </div>

                  <a
                    href={branch.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-5 text-sm font-medium text-primary hover:underline"
                  >
                    Построить маршрут
                  </a>

                </div>

              </div>
            ))}

          </div>

        </div>
      </section>

      <Footer />

    </div>
  );
};

export default Home;