import { motion } from "framer-motion";

const ChairmanMessage = () => {
  return (
    <motion.div
      className="focus-card glass-card group relative w-full max-w-3xl mx-auto overflow-hidden rounded-2xl backdrop-blur-lg border border-white/30 dark:border-white/20 shadow-2xl"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mt-10">
        <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 lg:grid-cols-2 items-center">
          <motion.div
            className="max-w-xl text-center lg:text-left"
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl text-center font-bold text-white font-fredoka">Chairman</h3>
            <p className="text-gray-300 mt-6 font-poppins leading-relaxed">
              “At Vidhyardhi School, we believe in nurturing not only academic excellence but also strong values and leadership in our students. Together, we shape the future.”
            </p>
            <p className="text-right font-bold text-gray-300 font-fredoka">-- Chairman's Message</p>
          </motion.div>

          <motion.div
            className="flex flex-col items-center"
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <div className="relative w-60 h-60 flex items-center justify-center">
              <span className="circle-spin absolute inset-0 scale-110"></span>
              <img
                src="../../../src/assets/images/chairman.jpg"
                alt="Chairman"
                className="w-52 h-52 object-cover rounded-full border-4 border-white shadow-xl relative z-10"
              />
            </div>
            <h3 className="text-xl font-bold text-white font-fredoka mt-4">Mrs. Sandhya Undavalli</h3>
            <p className="text-sm text-gray-300 font-poppins">Chairman</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChairmanMessage;
