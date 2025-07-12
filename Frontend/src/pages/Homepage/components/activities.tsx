import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import scienceImage from "../../../assets/images/science.png";
import chessImage from "../../../assets/images/chess.jpg";
import FieldTripImage from "../../../assets/images/Field Trip.jpg"
import HelpingHandImage from "../../../assets/images/helpinghands.jpg"

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
    imageSrc: scienceImage,
    altText: "Science Fair",
    modalTitle: "Science Fair",
    modalDescription:
      "Our science fair encourages creativity and innovation with student projects, experiments, and presentations.",
    modalImages: [
      // "/assets/science1.jpeg",
      // "/assets/science2.jpeg",
      // "/assets/science3.jpeg",
    ],
  },
  {
    title: "Chess Club",
    description: "Strategic thinking through the ancient game of kings.",
    imageSrc: chessImage,
    altText: "Chess Club",
    modalTitle: "Chess Club & Championship",
    modalDescription: `
  The Vidhyardhi School Chess Club is a dynamic program that introduces students to the intellectually enriching world of chess. It aims to nurture strategic thinking, foresight, planning, and patience — qualities that are essential not only on the chessboard but also in real life.
  Students of all age groups, from beginners to advanced players, are welcome to join and explore the fascinating world of chess. The program is structured to gradually develop a student’s skill from fundamental openings and midgame tactics to advanced endgame strategies. We believe chess fosters mental discipline and sharpens the mind through consistent practice and thoughtful play.
  Our chess curriculum is divided into weekly sessions, each dedicated to a specific aspect of the game. Beginners start with the rules, piece movements, and basic checkmates. As students progress, they engage in lessons on positional play, tactical motifs like forks, pins, skewers, and more nuanced strategies like prophylaxis and zugzwang. 
  In addition to classroom training, students engage in regular practice matches, puzzle-solving contests, and inter-house tournaments. These tournaments not only boost competitive spirit but also teach students sportsmanship, focus under pressure, and resilience after defeat — all within a safe and encouraging environment.
  The Chess Club also organizes a yearly Chess Championship. The event is conducted in a Swiss-style format, ensuring every student plays multiple matches regardless of performance. Winners and outstanding performers are recognized with medals, certificates, and trophies. Top players are even nominated to represent the school at district and state-level chess meets.
  Moreover, the club runs thematic events like “Blindfold Chess,” “Simultaneous Exhibition Matches,” and “Parent-Child Tournaments” to involve the wider school community and demonstrate the universal appeal of the game.
  Chess at Vidhyardhi School is more than a game — it’s a mental gymnasium where students exercise their brains, develop focus, and learn patience, humility, and confidence. The club encourages students to think critically before acting, a habit that has positive ripple effects on their academics and personal development.
  Students also explore chess history, studying famous grandmasters like Garry Kasparov, Bobby Fischer, and Judit Polgár. They are taught to analyze classic games, understand famous openings like the Sicilian Defense, Ruy López, and Queen’s Gambit, and evaluate positions using both intuition and calculation.
  Digital tools like chess.com and Lichess are integrated into our learning process. Students use these platforms to practice puzzles, play timed matches, and analyze games with powerful engines. These resources make learning chess both engaging and tech-savvy, keeping students excited and connected with the global chess community.
  Our in-house coaches — many of whom hold international ratings — provide personalized feedback and encourage healthy peer-to-peer mentorship. Advanced students are given opportunities to lead small workshops, reinforcing their knowledge through teaching.
  The Chess Club is not just about winning games; it’s about building character. Every move on the board reflects a decision, and every decision teaches responsibility. It builds habits of logical reasoning, quiet concentration, and thoughtful action — attributes that empower children far beyond the 64 squares.
  Parents often report that their children become calmer, more focused, and academically stronger after consistent chess practice. These positive effects are reinforced by research showing that chess improves memory, comprehension, and even mathematical performance.
  We also collaborate with national and international chess federations to host webinars and guest sessions. Visiting masters often conduct game dissections, share personal stories, and inspire students with their journeys.
  In summary, the Chess Club at Vidhyardhi School is a vibrant, evolving platform where minds are honed, friendships are built, and life lessons are learned — all under the quiet intensity of a well-played game of chess.
    `,
    modalImages: [
      // "/assets/chess1.jpg",
      // "/assets/chess2.jpg",
      // "/assets/chess3.jpg",
    ],
  }
  
];

const extraCurricularCards: CardProps[] = [
  {
    title: "Field Trips",
    description: "Educational excursions.",
    imageSrc: FieldTripImage,
    altText: "Field Trips",
    modalTitle: "Field Trips",
    modalDescription:
      `At Vidhyardhi School, we believe that education should transcend the four walls of the classroom. Our thoughtfully planned field trips are designed to offer students real-world exposure that complements their academic curriculum. These excursions are more than just outings—they are immersive learning experiences that inspire curiosity, exploration, and reflection. Whether students are walking through the halls of a museum, observing wildlife in a national park, visiting a planetarium, or interacting with scientists in a research center, each trip is carefully aligned with their grade-level learning objectives and academic themes.
      For younger students, the focus is on sensory learning and environmental awareness. Visits to botanical gardens, farms, and zoological parks introduce them to the basics of nature, plant life, animal behavior, and the importance of ecosystems. These experiences help build early scientific thinking and environmental consciousness. As students grow, their field trips become increasingly subject-specific. Middle schoolers visit historical monuments, science museums, and eco-parks, allowing them to connect classroom theories to real-world applications. Senior students take more advanced trips to industries, universities, and cultural institutions, giving them a taste of practical knowledge, career pathways, and future academic opportunities.
        Every field trip at Vidhyardhi School includes pre-trip orientation sessions where students learn about the site they will visit, what to observe, and how to take notes. They are encouraged to carry journals to record their observations, take photographs for projects, and participate actively in discussions and Q&A sessions. Teachers and subject experts accompany the students to guide their exploration, ensuring that academic goals are met in a safe and engaging environment. Post-trip activities, such as group presentations, art reflections, and report writing, help consolidate the learning and encourage collaboration.
        We also integrate themes of social awareness and civic responsibility into our trips. Visits to local NGOs, fire stations, police departments, and community centers expose students to the functioning of society and inspire a sense of duty and empathy. They learn about real-world challenges and the importance of contributing to community welfare. Similarly, trips to banks, post offices, and courts introduce them to basic economics, communication systems, and governance.
        Safety and well-being are top priorities on all our trips. We maintain optimal student-teacher ratios, provide first-aid support, ensure hygienic food arrangements, and keep parents informed with real-time updates. Each journey is supervised by trained faculty and support staff who are equipped to handle all kinds of student needs and contingencies.
        Our field trips also aim to create unforgettable memories. The joy of traveling together, exploring new places, and learning in the real world fosters stronger peer bonds and boosts student morale. These experiences leave a lasting impression, often becoming turning points in a child’s educational journey. At Vidhyardhi School, we are proud to offer such opportunities that spark a lifelong love for learning, help develop confident global citizens, and truly bring education to life beyond textbooks and tests.`,
    modalImages: [
      // "/assets/fieldtrip1.jpeg",
      // "/assets/fieldtrip2.jpeg",
      // "/assets/fieldtrip3.jpg",
      // "/assets/fieldtrip4.jpg",
    ],
  },
  {
    title: "Helping Hands",
    description: "Community service programs.",
    imageSrc: HelpingHandImage,
    altText: "Helping Hands",
    modalTitle: "Helping Hands",
    modalDescription:
      `
Helping Hands is one of the most heartfelt and impactful initiatives at Vidhyardhi School, designed to nurture compassion, empathy, and social responsibility among our students. At its core, Helping Hands empowers students to look beyond themselves and discover the joy of giving, supporting, and making a difference in the lives of others. Through carefully curated service-based activities and community engagement programs, we aim to instill a sense of humanity and duty that lasts well beyond their school years.
From a young age, students are introduced to the value of kindness and community through age-appropriate volunteering experiences. For our youngest learners, this may begin with simple activities like making thank-you cards for local sanitation workers, planting trees in the school garden, or collecting gently used books and toys for donation drives. As students grow older, their role in the program deepens. Middle and senior school students actively participate in visits to orphanages, old-age homes, and special needs centers, where they not only contribute donations but also spend meaningful time interacting with residents, listening to their stories, and sharing joy.
Each Helping Hands project is anchored in learning. Students are encouraged to research the cause, understand the context, and reflect on their experience. They journal their observations, write essays, and present their learnings in class, fostering deeper understanding and critical thinking. The initiative is not just about charity—it’s about empathy in action. Through this program, students learn the importance of dignity, respect, and humility. They begin to understand that every person, regardless of background or circumstance, deserves compassion and care.
We collaborate with local NGOs, healthcare organizations, environmental groups, and civic bodies to offer real and relevant opportunities for service. Clean-up drives, food distribution programs, awareness rallies, blood donation camps, and inclusive sports days are just a few of the many ways students engage with the broader community. Our “Warmth for Winter” and “Back to School” campaigns, led entirely by student volunteers, have collected and distributed thousands of items to underprivileged children and families across the region.
Helping Hands is also woven into our school calendar through dedicated days of service, kindness weeks, and social action exhibitions. These events showcase the efforts of students and allow them to inspire peers and parents alike. Students not only raise awareness but also take initiative—planning logistics, designing posters, speaking in assemblies, and even initiating fundraisers. They learn the importance of teamwork, leadership, and accountability, not in a classroom simulation, but in the real world.
Parents play an active role as partners in this journey, often volunteering alongside their children or supporting from behind the scenes. The result is a strong community of learners who understand that success is not just measured by grades, but by the positive impact one creates. At Vidhyardhi School, Helping Hands is more than a program—it’s a culture. A culture of kindness, initiative, and responsibility. Through every small act of service, we are building thoughtful citizens who will lead with heart, serve with purpose, and inspire change wherever they go.
`,
    modalImages: [
      // "/assets/helpinghands1.jpeg",
      // "/assets/helpinghands2.jpeg",
      // "/assets/helpinghands3.jpg",
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
