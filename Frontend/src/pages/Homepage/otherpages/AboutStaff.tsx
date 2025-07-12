import { useScroll, useTransform, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselItem } from "@/components/ui/carousel";

import FriendlyTeacher from "../../../assets/images/Friendly Teacher.jpg";
import ResponsibleTeacher from "../../../assets/images/Responsible Teacher.jpg";
import CreativeTeacher from "../../../assets/images/Creative Teacher.jpg";
import PatientTeacher from "../../../assets/images/Patience Teacher.jpg";
import MotivationalTeacher from "../../../assets/images/Motivational Teacher.jpg";
import DisciplinedTeacher from "../../../assets/images/Disciplined Teacher.jpg";

const staffQualities = [
  {
    title: "Friendly & Approachable",
    image: FriendlyTeacher,
    description:
      "Our staff create a warm and welcoming environment. Children feel safe to express themselves and build strong bonds with their teachers.",
    values: ["Positive Attitude", "Open Communication", "Trust Building"],
  },
  {
    title: "Responsible & Reliable",
    image: ResponsibleTeacher,
    description:
      "Every teacher takes full responsibility for their students’ growth—academically, emotionally, and socially.",
    values: ["Timely Support", "Accountability", "Consistency"],
  },
  {
    title: "Creative & Inspiring",
    image: CreativeTeacher,
    description:
      "Our educators use creative techniques and out-of-the-box ideas to spark imagination and engagement in the classroom.",
    values: ["Storytelling", "Hands-on Learning", "Innovative Lessons"],
  },
  {
    title: "Patient & Supportive",
    image: PatientTeacher,
    description:
      "We understand every child learns differently. Our patient staff guide students with calmness and compassion.",
    values: ["Individual Attention", "Empathy", "Growth Mindset"],
  },
  {
    title: "Disciplined & Focused",
    image: MotivationalTeacher,
    description:
      "Structure and discipline help children develop strong habits. Our staff model focus and self-regulation every day.",
    values: ["Routine Building", "Goal Setting", "Time Management"],
  },
  {
    title: "Visionary & Motivational",
    image: DisciplinedTeacher,
    description:
      "Our staff act as role models who inspire lifelong learning and help children dream big and believe in themselves.",
    values: ["Mentorship", "Career Awareness", "Confidence Building"],
  },
];

const testimonials = [
  "The staff are so friendly and treat our kids like their own. It’s a second home!",
  "I love how the teachers communicate with parents and constantly encourage the children.",
  "My child was shy before joining, now they are confident and curious thanks to the wonderful teachers!",
  "One of the best decisions I made was choosing this school. The educators are exceptional.",
];

const iconUrls = [
  { src: "https://cdn-icons-png.flaticon.com/512/3845/3845826.png", className: "top-[40px] left-[20px] w-24 h-24" },
  { src: "https://cdn-icons-png.flaticon.com/512/2860/2860900.png", className: "top-[60px] right-[10%] w-20 h-20" },
  { src: "https://cdn-icons-png.flaticon.com/512/1055/1055646.png", className: "top-[140px] right-[30px] w-16 h-16" },
  { src: "https://cdn-icons-png.flaticon.com/512/2907/2907591.png", className: "bottom-[400px] left-[5%] w-24 h-24" },
  { src: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png", className: "bottom-[350px] right-[10%] w-20 h-20" },
  { src: "https://cdn-icons-png.flaticon.com/512/888/888879.png", className: "bottom-[450px] right-[30%] w-24 h-24" },
];

const AboutStaff = () => {
  const { scrollY } = useScroll();
  const layerYs = iconUrls.map((_, i) =>
    useTransform(scrollY, [0, 1000], [0, (i % 2 === 0 ? 60 : -60) + i * 5])
  );

  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-[#80cb2e] to-[#69306d] px-4 py-12 text-gray-800 transition-all">
      {/* Home Button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 bg-white text-purple-700 px-4 py-2 rounded-full shadow-md hover:bg-purple-100 transition-all"
      >
        🏠 Home
      </button>

      {/* Decorative Icons */}
      {iconUrls.map((icon, i) => (
        <motion.img
          key={i}
          src={icon.src}
          alt={`Decorative Icon ${i}`}
          style={{ y: layerYs[i] }}
          className={`absolute ${icon.className} opacity-10 z-0`}
        />
      ))}

      {/* Heading */}
      <motion.h1
        className="relative z-10 text-5xl font-bold text-center text-white mb-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Meet Our Dedicated Staff
      </motion.h1>

      <motion.p
        className="relative z-10 text-center max-w-2xl mx-auto text-lg text-white/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Our school takes immense pride in its staff—caring, qualified, and committed to shaping bright futures with love and excellence.
      </motion.p>

      <Separator className="my-8 bg-white/30 relative z-10" />

      {/* Staff Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
        {staffQualities.map((item, index) => (
          <motion.div
            key={item.title}
            className="rounded-3xl overflow-hidden shadow-2xl bg-white border border-purple-100"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-64 object-cover object-top"
            />
            <Card className="border-none shadow-none">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-purple-700 mb-2">{item.title}</h2>
                <p className="text-gray-700 mb-3">{item.description}</p>
                <div className="flex flex-wrap gap-2">
                  {item.values.map((value) => (
                    <span
                      key={value}
                      className="bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full font-medium"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Staff Strength Section */}
      <motion.div
        className="mt-16 text-center relative z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <h3 className="text-3xl font-semibold text-white mb-2">Why Our Staff Stand Out</h3>
        <p className="text-lg text-white/90 max-w-2xl mx-auto">
          All our staff are university-qualified, background-verified, trained in child psychology and modern teaching methodologies.
          They’re not just teachers—they're mentors, guides, and trusted companions in your child's journey.
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
        <h2 className="text-3xl font-bold text-center text-white mb-6">What Parents Say</h2>
        <Carousel>
          {testimonials.map((quote, idx) => (
            <CarouselItem key={idx} className="p-6">
              <div className="bg-white border border-purple-100 rounded-xl p-6 text-center shadow-md">
                <p className="text-lg text-gray-700 italic">"{quote}"</p>
              </div>
            </CarouselItem>
          ))}
        </Carousel>
      </motion.div>
    </div>
  );
};

export default AboutStaff;
