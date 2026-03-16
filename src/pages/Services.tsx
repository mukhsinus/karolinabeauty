// src/pages/Services.tsx
import Navbar from "@/components/Navbar";
import ServicesSection from "@/components/ServicesSection";
import Footer from "@/components/Footer";


const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ServicesSection />

      <Footer />
    </div>
  );
};

export default Services;