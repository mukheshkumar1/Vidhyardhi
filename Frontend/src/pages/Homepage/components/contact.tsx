/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaPhone,
  FaLocationDot,
  FaFacebook,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa6";
import { toast } from "sonner"; // ✅ Toast for notifications

export default function ContactSection() {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <section
      id="contact"
      className="py-16 px-6 text-center"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <h2 className="text-3xl font-bold font-fredoka text-white">Contact Us</h2>

      <p className="mt-4 text-gray-300">
        <FaEnvelope className="inline mr-2" />
        <strong className="text-gray-300 font-fredoka">Email:</strong>{" "}
        <a
          href="mailto:vidhyaradhi.e.m.school25@gmail.com"
          className="hover:underline text-gray-300 font-poppins"
        >
          vidhyaradhi.e.m.school25@gmail.com
        </a>
      </p>

      <p className="mt-2 text-gray-300">
        <FaPhone className="inline mr-2" />
        <strong className="text-gray-300 font-fredoka">Phone:</strong>{" "}
        <a
          href="tel:+919849244277"
          className="hover:underline text-gray-300 font-poppins"
        >
          9849244277
        </a>
      </p>

      <p className="mt-2 text-gray-300 font-poppins">
        <FaLocationDot className="inline mr-2" />
        <strong className="text-gray-300 font-fredoka">Address:</strong> Near
        Current Office Railway Gate, Gayatri Nagar, Nellore
      </p>

      <div className="mt-6 flex justify-center">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d966.0478433861601!2d79.9616579695136!3d14.41612889800603!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4cf2e193e314e1%3A0x58930f56e5d739d8!2s26-1-106-5%2C%20Gayathri%20Nagar%2C%20Police%20Colony%2C%20Nellore%2C%20Andhra%20Pradesh%20524004%2C%20India!5e0!3m2!1sen!2sus!4v1749718146272!5m2!1sen!2sus"
          className="w-full max-w-md h-64 md:h-80 rounded-lg border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>

      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:scale-105 transition-transform shadow-lg"
        >
          Register
        </button>
      </div>

      <div className="mt-8 text-white">
        <strong className="block text-lg">Follow Us:</strong>
        <div className="mt-4 flex justify-center space-x-6 text-2xl text-gray-300">
          <a href="#" className="hover:text-sky-500"><FaFacebook /></a>
          <a href="#" className="hover:text-sky-500"><FaLinkedin /></a>
          <a href="https://www.instagram.com/vidhyardhi_25/" className="hover:text-pink-500"><FaInstagram /></a>
          <a href="#" className="hover:text-red-500"><FaYoutube /></a>
          <a href="#" className="hover:text-green-500"><FaWhatsapp /></a>
        </div>
      </div>

      {isModalOpen && <RegisterModal onClose={() => setModalOpen(false)} />}
    </section>
  );
}

function RegisterModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    fullName: "",
    parentName: "",
    relation: "",
    previousSchool: "",
    siblings: "",
    studentAge: "",
    className: "",
    email: "",
    phone: "",
  });
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Submitting...");

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Registered successfully!");
        setStatus("Registered successfully!");
        setFormData({
          fullName: "",
          parentName: "",
          relation: "",
          previousSchool: "",
          siblings: "",
          studentAge: "",
          className: "",
          email: "",
          phone: "",
        });
      } else {
        toast.error(data.message || "Registration failed");
        setStatus(data.message || "Error");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Server error");
      setStatus("Server error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-lg bg-white bg-opacity-90 rounded-3xl shadow-2xl p-8"
      >
        <button
          className="absolute top-4 right-5 text-2xl text-gray-700 hover:text-red-500"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Register Now
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-950 font-bold">
          {[
            { name: "fullName", placeholder: "Full Name" },
            { name: "parentName", placeholder: "Parent's Name" },
            { name: "relation", placeholder: "Relation (Father, Mother...)" },
            { name: "previousSchool", placeholder: "Previous School" },
          ].map((field) => (
            <input
              key={field.name}
              type="text"
              required={field.name !== "previousSchool"}
              placeholder={field.placeholder}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={(formData as any)[field.name]}
              onChange={(e) =>
                setFormData({ ...formData, [field.name]: e.target.value })
              }
            />
          ))}

          <select
            required
            value={formData.className}
            onChange={(e) =>
              setFormData({ ...formData, className: e.target.value })
            }
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Grade</option>
            {[...Array(7)].map((_, i) => (
              <option key={i + 1} value={`Grade ${i + 1}`}>
                Grade {i + 1}
              </option>
            ))}
          </select>

          {[
            { name: "siblings", placeholder: "Siblings", type: "text" },
            { name: "studentAge", placeholder: "Student Age", type: "number" },
            { name: "email", placeholder: "Email Address", type: "email" },
            { name: "phone", placeholder: "Phone Number", type: "tel" },
          ].map((field) => (
            <input
              key={field.name}
              type={field.type}
              required={field.name !== "siblings"}
              placeholder={field.placeholder}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={(formData as any)[field.name]}
              onChange={(e) =>
                setFormData({ ...formData, [field.name]: e.target.value })
              }
            />
          ))}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2 rounded-xl hover:scale-105 transition-transform"
          >
            Submit
          </button>

          {status && (
            <p className="text-sm mt-2 text-center text-gray-600">{status}</p>
          )}
        </form>
      </motion.div>
    </div>
  );
}
