// src/pages/Booking.tsx
import Navbar from "@/components/Navbar";
import BookingSection from "@/components/booking/BookingSection";
import Footer from "@/components/Footer";

const Booking = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      <Navbar />

      <main className="flex-1">
        <BookingSection />
      </main>

      <Footer />

    </div>
  );
};

export default Booking;