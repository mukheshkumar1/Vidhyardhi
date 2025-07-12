import { useScroll, useTransform, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselItem } from "@/components/ui/carousel";

// ✅ Import Local Images
import conceptImg from "../../../assets/images/Clarity-Concepts.png";
import personalizedImg from "../../../assets/images/Personalized-Learning.png";
import assessmentImg from "../../../assets/images/Strong-Assessment.png";
import techImg from "../../../assets/images/Modern-Tech.jpeg";
import thinkingImg from "../../../assets/images/critical-thinking.jpg";
import interdisciplinaryImg from "../../../assets/images/Interdisciplinary-Approach.png";

const academicQualities = [
  {
    title: "Concept Clarity",
    image: conceptImg,
    description:
      "We prioritize deep understanding over rote learning. Students are taught how and why things work—building strong foundational concepts.",
    values: ["Logical Thinking", "Interactive Models", "Doubt Resolution"],
  },
  {
    title: "Personalized Learning",
    image: personalizedImg,
    description:
      "Every student learns at their own pace. Our teachers tailor instruction to individual needs using assessments and feedback loops.",
    values: ["Individual Attention", "Differentiated Instruction", "Mentoring"],
  },
  {
    title: "Strong Assessment System",
    image: assessmentImg,
    description:
      "We conduct regular assessments that are constructive and aligned to learning goals—ensuring mastery of concepts.",
    values: ["Continuous Evaluation", "Formative Feedback", "Performance Tracking"],
  },
  {
    title: "Modern Tools & Tech",
    image: techImg,
    description:
      "Smart classrooms and educational technology help make learning engaging and up-to-date with 21st-century needs.",
    values: ["Smart Boards", "Interactive Apps", "Gamified Learning"],
  },
  {
    title: "Critical & Creative Thinking",
    image: thinkingImg,
    description:
      "We encourage students to ask questions, analyze ideas, and solve problems creatively—empowering them beyond academics.",
    values: ["Project-Based Learning", "Debates & Discussions", "Curiosity Building"],
  },
  {
    title: "Interdisciplinary Approach",
    image: interdisciplinaryImg,
    description:
      "Our curriculum connects subjects and real life, helping students see the bigger picture and understand how knowledge is applied.",
    values: ["STEM Integration", "Art-Science Balance", "Real-Life Application"],
  },
];

const testimonials = [
  "The academic approach here is very thoughtful. My child enjoys learning and is actually understanding concepts.",
  "We’ve seen great improvement in our daughter's confidence and grades since joining.",
  "The teachers don’t rush topics. They ensure every child is on board before moving forward.",
  "The integration of tech in classrooms makes learning fun and futuristic!",
];

const iconUrls = [
  { src: "https://cdn-icons-png.flaticon.com/512/942/942748.png", className: "top-[40px] left-[20px] w-24 h-24" },
  { src: "https://cdn-icons-png.flaticon.com/512/3461/3461536.png", className: "top-[80px] right-[12%] w-20 h-20" },
  { src: "https://cdn-icons-png.flaticon.com/512/2630/2630873.png", className: "bottom-[420px] left-[10%] w-20 h-20" },
  { src: "https://cdn-icons-png.flaticon.com/512/1048/1048953.png", className: "bottom-[400px] right-[10%] w-24 h-24" },
  { src: "https://cdn-icons-png.flaticon.com/512/3405/3405765.png", className: "bottom-[300px] right-[25%] w-16 h-16" },
];

const AboutAcademics = () => {
  const { scrollY } = useScroll();
  const layerYs = iconUrls.map((_, i) =>
    useTransform(scrollY, [0, 1000], [0, (i % 2 === 0 ? 60 : -60) + i * 5])
  );

  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-[#5f72bd] to-[#9b23ea] px-4 py-12 text-gray-800 transition-all">
      {/* 🏠 Home Button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 bg-white text-purple-700 px-4 py-2 rounded-full shadow-md hover:bg-purple-100 transition-all"
      >
        🏠 Home
      </button>

      {/* Floating Icons */}
      {iconUrls.map((icon, i) => (
        <motion.img
          key={i}
          src={icon.src}
          alt={`Icon ${i}`}
          style={{ y: layerYs[i] }}
          loading="lazy"
          className={`absolute ${icon.className} opacity-10 z-0`}
        />
      ))}

      {/* Title */}
      <motion.h1
        className="relative z-10 text-5xl font-bold text-center text-white mb-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Excellence in Academics
      </motion.h1>

      <motion.p
        className="relative z-10 text-center max-w-2xl mx-auto text-lg text-white/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        At our school, academic success isn’t just about marks—it’s about mastery, motivation, and meaningful learning.
      </motion.p>

      <Separator className="my-8 bg-white/30 relative z-10" />

      {/* Academic Qualities Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
        {academicQualities.map((item, index) => (
          <motion.div
            key={item.title}
            className="rounded-2xl overflow-hidden shadow-xl border border-white/10 backdrop-blur-md bg-white/10 hover:scale-[1.015] transition-all duration-300"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <img
              src={item.image}
              loading="lazy"
              alt={item.title}
              className="w-full h-48 object-cover rounded-t-2xl"
            />
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-2">{item.title}</h2>
              <p className="text-white/80 mb-3">{item.description}</p>
              <div className="flex flex-wrap gap-2">
                {item.values.map((value) => (
                  <span
                    key={value}
                    className="bg-white/20 border border-white/10 text-white text-sm px-3 py-1 rounded-full font-medium backdrop-blur"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Section Info */}
      <motion.div
        className="mt-16 text-center relative z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <h3 className="text-3xl font-semibold text-white mb-2">Transforming Education</h3>
        <p className="text-lg text-white/90 max-w-2xl mx-auto">
          We are redefining education by balancing academics with curiosity, application, and empathy—nurturing both intelligence and character.
        </p>
      </motion.div>

      {/* Testimonials */}
      <motion.div
        className="relative z-10 mt-24 max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6">Parent Voices</h2>
        <Carousel>
          {testimonials.map((quote, idx) => (
            <CarouselItem key={idx} className="p-6">
              <div className="bg-white/10 border border-white/20 rounded-xl p-6 text-center shadow-md backdrop-blur">
                <p className="text-lg text-white/80 italic">"{quote}"</p>
              </div>
            </CarouselItem>
          ))}
        </Carousel>
      </motion.div>
    </div>
  );
};

export default AboutAcademics;
