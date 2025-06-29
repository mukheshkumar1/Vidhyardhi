import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "About School",
    image: "../../../src/assets/images/school1.jpg", // Make sure this path is public or imported
    link: "/school",
    description: "Sustainability and learning go hand in hand at our school.",
  },
  {
    title: "Staff",
    image: "../../../src/assets/images/staff.jpg",
    link: "/staff",
    description: "Our highly qualified teachers nurture students with dedication.",
  },
  {
    title: "Academics",
    image: "../../../src/assets/images/academics.jpg",
    link: "/academics",
    description: "We follow a modern curriculum with an emphasis on innovation.",
  },
];

export default function ParallelogramCards() {
  return (
   
    <section className="card-section">
      <motion.h2
          className="text-3xl font-bold text-center mb-8 text-white font-fredoka"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          About Us
        </motion.h2>
       <div className="children-img-wrapper">
              <img src="../../../src/assets/images/children-left.png" alt="Children" className="children-img" />
            </div>
      {sections.map((section, index) => (
        <motion.div
          key={index}
          className="card-wrapper"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
          viewport={{ once: true }}
        >

           {/* Optional Left-Side Children Image */}
  
           
         
          {/* Image on Left */}
          <div className="image-wrapper">
            <img src={section.image} alt={section.title} className="circle-image overlap-image" />
          </div>

          {/* Parallelogram Card on Right */}
          <div className="parallelogram-card">
            <h3 className="text-2xl font-bold mb-2">{section.title}</h3>
            <p className="text-sm mb-6">{section.description}</p>
            <Link
              to={section.link}
              className="readmore-btn"
            >
              Read More
            </Link>
          </div>
         
        </motion.div>
        
      ))}
      
    </section>
  );
}
