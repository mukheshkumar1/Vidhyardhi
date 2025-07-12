import { motion } from "framer-motion";
import { decorativeSvgs } from "./components/decorativeSvgs"; // adjust path
import AboutSection from "./components/about";
import HomeSection from "./components/homeSection";
import Navbar from "./components/navbar";
import GallerySection from "./components/Gallery";
import Footer from "./components/footer";
import ActivitiesTab from "./components/activities";
import Calendar from "../Admin/components/Calender";
import ContactSection from "./components/contact";

const Homepage = () => {
  return (
    <div className="relative bg-[#44701b] min-h-screen transition-all text-gray-200 overflow-hidden">
      {/* 🌟 Decorative Background SVGs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {decorativeSvgs.map((svg, idx) =>
          svg.animate ? (
            <motion.img
              key={idx}
              src={svg.src}
              alt={`bg-icon-${idx}`}
              loading="lazy"
              className={`absolute opacity-10 ${svg.className}`}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : (
            <img
              key={idx}
              src={svg.src}
              alt={`bg-icon-${idx}`}
              loading="lazy"
              className={`absolute opacity-10 ${svg.className}`}
            />
          )
        )}
      </div>

      {/* 🧱 Actual Content */}
      <Navbar />
      <div className="h-16" />
      <HomeSection />
      <AboutSection />
      <ActivitiesTab />
      <Calendar />
      <div className="my-12" />
      <GallerySection />
      <ContactSection />
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
};

export default Homepage;
