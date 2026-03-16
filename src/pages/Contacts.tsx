// src/pages/Contacts.tsx
import Navbar from "@/components/Navbar";
import ContactsSection from "@/components/ContactsSection";
import Footer from "@/components/Footer";


const Contacts = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ContactsSection />

      <Footer />
    </div>
  );
};

export default Contacts;