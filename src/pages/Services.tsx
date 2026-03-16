// src/pages/Services.tsx
import Navbar from "@/components/Navbar";
import ServicesSection from "@/components/ServicesSection";
import Footer from "@/components/Footer";
import StickyBookingButton from "@/components/StickyBookingButton";

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ServicesSection />
      <StickyBookingButton />
      <Footer />
    </div>
  );
};

export default Services;