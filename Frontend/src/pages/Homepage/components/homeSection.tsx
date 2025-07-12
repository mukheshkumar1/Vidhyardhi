import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ChairmanMessage from "./chairmanMessage";
import { usePreloadImages } from "@/hooks/usePreloadImages"; 

import school1 from "../../../assets/images/school1.jpg";
import school2 from "../../../assets/images/school2.jpg";
import school3 from "../../../assets/images/school3.jpg";
import school4 from "../../../assets/images/school4.jpg";
import school5 from "../../../assets/images/school5.jpg";

const bgImages = [school1, school2, school3, school4, school5];

const HomeSection = () => {
  const [bgIndex, setBgIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ✅ Preload all images
  usePreloadImages(bgImages);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setBgIndex((prevIndex) => (prevIndex + 1) % bgImages.length);
        setIsTransitioning(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section
        id="home"
        className="relative text-center py-40 bg-cover bg-center overflow-hidden"
      >
        {/* ✅ Static hidden img elements to preload visually */}
        <div className="hidden">
          {bgImages.map((src, i) => (
            <img key={i} src={src} alt={`bg preload ${i}`} loading="eager" />
          ))}
        </div>

        {/* Background Transition Layer */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-all duration-500 ease-in-out`}
          style={{
            backgroundImage: `url(${bgImages[bgIndex]})`,
            filter: isTransitioning ? "blur(10px)" : "blur(0px)",
            opacity: isTransitioning ? 0.5 : 1,
            backgroundColor: "#222", // Fallback
          }}
        ></div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />

        {/* Welcome Text */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-bold text-white font-lobster">
            Welcome to <strong style={{ color: "#80cb2e" }}>Vidhy</strong>
            <strong style={{ color: "#F09C13" }}>ardhi</strong> School
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Providing quality education for a brighter future.
          </p>
        </motion.div>
      </section>

      {/* Vision + Chairman */}
      <section id="vision" className="py-16 px-6 mx-auto mt-10">
        <motion.h2
          className="text-3xl font-bold text-center text-white font-fredoka"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          Our Vision
        </motion.h2>

        <motion.p
          className="text-gray-300 mt-4 text-center font-poppins max-w-3xl mx-auto font-bold"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          At Vidhyardhi School, our vision is to create an inspiring learning
          environment where students are encouraged to think critically, act
          ethically, and grow holistically to become global citizens of tomorrow.
        </motion.p>

        <ChairmanMessage />
      </section>
    </>
  );
};

export default HomeSection;
