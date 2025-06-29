import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type CardProps = {
  title: string;
  description: string;
  imageSrc: string;
  altText: string;
  modalTitle: string;
  modalDescription: string;
  modalImages: string[];
};

const academicsCards: CardProps[] = [
  {
    title: "Science Fair",
    description: "Annual science projects showcase.",
    imageSrc: "/assets/sciencefair.jpeg",
    altText: "Science Fair",
    modalTitle: "Science Fair",
    modalDescription:
      "Our science fair encourages creativity and innovation with student projects, experiments, and presentations.",
    modalImages: [
      "/assets/science1.jpeg",
      "/assets/science2.jpeg",
      "/assets/science3.jpeg",
    ],
  },
  {
    title: "Math Olympiad",
    description: "Challenging math competitions.",
    imageSrc: "/assets/matholympiad.jpeg",
    altText: "Math Olympiad",
    modalTitle: "Math Olympiad",
    modalDescription:
      "Students participate in math competitions designed to enhance problem-solving and critical thinking.",
    modalImages: [
      "/assets/math1.jpeg",
      "/assets/math2.jpeg",
      "/assets/math3.jpeg",
    ],
  },
];

const extraCurricularCards: CardProps[] = [
  {
    title: "Field Trips",
    description: "Educational excursions.",
    imageSrc: "/assets/fieldtrip1.jpeg",
    altText: "Field Trips",
    modalTitle: "Field Trips",
    modalDescription:
      "At Vidhyardhi School, our field trips bridge classroom learning with real-world experiences.",
    modalImages: [
      "/assets/fieldtrip1.jpeg",
      "/assets/fieldtrip2.jpeg",
      "/assets/fieldtrip3.jpg",
      "/assets/fieldtrip4.jpg",
    ],
  },
  {
    title: "Helping Hands",
    description: "Community service programs.",
    imageSrc: "/assets/helpinghands.jpg",
    altText: "Helping Hands",
    modalTitle: "Helping Hands",
    modalDescription:
      "The 'Helping Hands' initiative teaches empathy and social responsibility through volunteering.",
    modalImages: [
      "/assets/helpinghands1.jpeg",
      "/assets/helpinghands2.jpeg",
      "/assets/helpinghands3.jpg",
    ],
  },
];

// Modal animation variants for Framer Motion
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

const ActivitiesTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"academics" | "extra">("academics");
  const [openModalIndex, setOpenModalIndex] = useState<number | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const cards = activeTab === "academics" ? academicsCards : extraCurricularCards;

  // Open modal for selected card index
  const openModal = (idx: number) => {
    setOpenModalIndex(idx);
    setZoomedImage(null); // reset zoom
  };

  // Close modal
  const closeModal = () => {
    setOpenModalIndex(null);
    setZoomedImage(null);
  };

  return (
    <section id="activities" className="container mx-auto px-6 py-16 text-white">
      {/* Tabs */}
      <div className="flex justify-center mb-12 space-x-6">
        <button
          onClick={() => setActiveTab("academics")}
          className={`px-6 py-2 rounded-full font-semibold text-lg ${
            activeTab === "academics"
              ? "bg-gradient-to-r from-[#ff7e5f] via-[#feb47b] to-[#ff7e5f] text-white shadow-lg"
              : "bg-white/20 hover:bg-white/40 text-white"
          } transition`}
        >
          Academics
        </button>
        <button
          onClick={() => setActiveTab("extra")}
          className={`px-6 py-2 rounded-full font-semibold text-lg ${
            activeTab === "extra"
              ? "bg-gradient-to-r from-[#ff7e5f] via-[#feb47b] to-[#ff7e5f] text-white shadow-lg"
              : "bg-white/20 hover:bg-white/40 text-white"
          } transition`}
        >
          Extra-Curricular
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {cards.map((card, idx) => (
          <div
            key={card.title}
            onClick={() => openModal(idx)}
            className="flex items-center bg-white/10 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg p-6 cursor-pointer hover:scale-[1.03] transition-transform"
          >
            <img
              src={card.imageSrc}
              alt={card.altText}
              className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-gradient-to-tr from-[#ff7e5f] via-[#feb47b] to-[#ff7e5f]"
            />
            <div className="ml-6 text-left">
              <h3 className="text-xl font-bold font-fredoka">{card.title}</h3>
              <p className="text-gray-300 text-sm font-poppins mt-1">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {openModalIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            onClick={closeModal}
          >
            <motion.div
              className="bg-black bg-opacity-90 max-w-3xl w-[90%] max-h-[90vh] p-6 rounded-lg shadow-2xl relative overflow-y-auto"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-3xl text-gray-400 hover:text-red-500"
                aria-label="Close modal"
              >
                ✖
              </button>
              <h2 className="text-3xl font-bold mb-4">{cards[openModalIndex].modalTitle}</h2>
              <p className="mb-6">{cards[openModalIndex].modalDescription}</p>

              {/* Carousel */}
              <div className="flex space-x-4 overflow-x-auto snap-x snap-mandatory rounded-md pb-2">
                {cards[openModalIndex].modalImages.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${cards[openModalIndex].modalTitle} ${i + 1}`}
                    className="h-40 snap-start rounded-lg cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setZoomedImage(img)}
                  />
                ))}
              </div>

              {/* Zoomed Image Viewer */}
              <AnimatePresence>
                {zoomedImage && (
                  <motion.div
                    className="fixed inset-0 z-[999] bg-black bg-opacity-90 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setZoomedImage(null)}
                  >
                    <motion.img
                      src={zoomedImage}
                      alt="Zoomed"
                      className="max-w-full max-h-full rounded-lg shadow-xl"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.8 }}
                      onClick={(e) => e.stopPropagation()} // Prevent close on image click
                      draggable={false}
                    />
                    <button
                      onClick={() => setZoomedImage(null)}
                      className="absolute top-6 right-6 text-white text-4xl hover:text-red-500"
                      aria-label="Close zoomed image"
                    >
                      ✖
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ActivitiesTab;
