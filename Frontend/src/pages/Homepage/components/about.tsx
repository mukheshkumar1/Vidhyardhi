import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";

// ✅ Import images properly
import school1 from "../../../assets/images/school1.jpg";
import staffImg from "../../../assets/images/staff.jpg";
import academicsImg from "../../../assets/images/academics.jpg";

// ✅ Icons reused from AboutSchool
const iconUrls = [
  { src: "https://cdn-icons-png.flaticon.com/512/942/942748.png", className: "top-[40px] left-[20px]" },
  { src: "https://cdn-icons-png.flaticon.com/512/3461/3461536.png", className: "top-[80px] right-[12%]" },
  { src: "https://cdn-icons-png.flaticon.com/512/2630/2630873.png", className: "bottom-[420px] left-[10%]" },
  { src: "https://cdn-icons-png.flaticon.com/512/1048/1048953.png", className: "bottom-[400px] right-[10%]" },
  { src: "https://cdn-icons-png.flaticon.com/512/3405/3405765.png", className: "bottom-[300px] right-[25%]" },
  { src: "https://cdn-icons-png.flaticon.com/512/753/753345.png", className: "top-[30%] left-[50%]" },
  { src: "https://cdn-icons-png.flaticon.com/512/166/166123.png", className: "bottom-[20%] right-[15%]" },
];

const sections = [
  {
    title: "About School",
    image: school1,
    link: "/school",
    description: "Sustainability and learning go hand in hand at our school.",
  },
  {
    title: "Staff",
    image: staffImg,
    link: "/staff",
    description: "Our highly qualified teachers nurture students with dedication.",
  },
  {
    title: "Academics",
    image: academicsImg,
    link: "/academics",
    description: "We follow a modern curriculum with an emphasis on innovation.",
  },
];

export default function ParallelogramCards() {
  return (
    <section className="card-section relative py-10 overflow-hidden">
      {/* ✅ Decorative floating icons */}
      {iconUrls.map((icon, index) => (
        <Box
          key={index}
          component="img"
          src={icon.src}
          alt={`icon-${index}`}
          className={`absolute ${icon.className}`}
          sx={{
            zIndex: 1,
            opacity: 0.08,
            width: { xs: 40, sm: 60, md: 80 },
            height: "auto",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* 🔠 Section Title */}
      <motion.h2
        className="text-3xl font-bold text-center mb-8 text-white font-fredoka"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        About Us
      </motion.h2>

      {/* 🃏 Card Sections */}
      {sections.map((section, index) => (
        <motion.div
          key={index}
          className="card-wrapper flex flex-col md:flex-row items-center gap-6 mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
          viewport={{ once: true }}
        >
          {/* 🎯 Image */}
          <div className="image-wrapper shrink-0">
            <img
              src={section.image}
              alt={section.title}
              className="circle-image overlap-image w-40 h-40 object-cover rounded-full shadow-lg border-4 border-white"
            />
          </div>

          {/* 📄 Parallelogram Content */}
          <div className="parallelogram-card bg-white/10 backdrop-blur-md p-6 rounded-xl text-white max-w-md shadow-lg border border-white/20">
            <h3 className="text-2xl font-bold mb-2 font-fredoka">{section.title}</h3>
            <p className="text-sm mb-6 font-poppins">{section.description}</p>
            <Link
              to={section.link}
              className="readmore-btn inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-semibold transition"
            >
              Read More
            </Link>
          </div>
        </motion.div>
      ))}
    </section>
  );
}
