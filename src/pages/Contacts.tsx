// src/pages/Contacts.tsx
import Navbar from "@/components/Navbar";
import ContactsSection from "@/components/ContactsSection";
import Footer from "@/components/Footer";
import StickyBookingButton from "@/components/StickyBookingButton";

const Contacts = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ContactsSection />
      <StickyBookingButton />
      <Footer />
    </div>
  );
};

export default Contacts;