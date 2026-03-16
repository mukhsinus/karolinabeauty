// src/pages/Gallery.tsx
import Navbar from "@/components/Navbar";
import GallerySection from "@/components/GallerySection";
import Footer from "@/components/Footer";
import StickyBookingButton from "@/components/StickyBookingButton";

const Gallery = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <GallerySection />
      <StickyBookingButton />
      <Footer />
    </div>
  );
};

export default Gallery;