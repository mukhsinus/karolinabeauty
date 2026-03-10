// src/pages/Booking.tsx
import Navbar from "@/components/Navbar";
import BookingSection from "@/components/BookingSection";
import Footer from "@/components/Footer";

const Booking = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BookingSection />
      <Footer />
    </div>
  );
};

export default Booking;