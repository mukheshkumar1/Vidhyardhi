import React, { useEffect } from 'react';

const Footer: React.FC = () => {
  useEffect(() => {
    // Set current year in copyright
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear().toString();
    }
  }, []);

  return (
    <footer
      className="bg-gradient-to-br from-[#69306d] to-[#80cb2e] text-white py-10 rounded-xl"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {/* School Name & Description */}
        <div>
          <h2 className="text-2xl font-bold">Vidhyardhi School</h2>
          <p className="mt-2 text-white/70">
            Providing quality education for a brighter future.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold">Quick Links</h3>
          <ul className="mt-2 space-y-2">
            <li><a href="#home" className="hover-effect font-poppins">Home</a></li>
            <li><a href="#about" className="hover-effect font-poppins">About</a></li>
            <li><a href="#academics" className="hover-effect font-poppins">Academics</a></li>
            <li><a href="#gallery" className="hover-effect font-poppins">Gallery</a></li>
            <li><a href="#contact" className="hover-effect font-poppins">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info + Social Media */}
        <div>
          <h3 className="text-xl font-semibold">Contact Us</h3>
          <p className="mt-2 text-white/70">
            Near Current Office Railway Gate, Gayatri Nagar, Nellore
          </p>
          <p className="mt-1 text-white/70">Phone: 9849244277</p>
          <p className="mt-1 text-white/70">Email: info@vidhyardhischool.com</p>

          {/* Social Icons */}
          <div className="mt-4 flex justify-center md:justify-start space-x-4">
            <a href="#" className="text-white/70 hover:text-blue-400 text-2xl transition">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="text-white/70 hover:text-sky-400 text-2xl transition">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://www.instagram.com/vidhyardhi_25/" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-pink-400 text-2xl transition">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="text-white/70 hover:text-red-400 text-2xl transition">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-center text-white/70 font-poppins text-sm">
        &copy; <span id="year"></span> Vidhyardhi School. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
