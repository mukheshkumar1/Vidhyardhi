import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  BookOpen,
  GalleryHorizontal,
  UsersRound,
  PhoneCall,
  User2,
  ChevronDown,
} from "lucide-react";
import "../../../assets/styles.css";
import logo from "../../../assets/images/logo5.png";
import LoginButton from "./loginButton";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdown, setAboutDropdown] = useState(false);
  const [loginDropdown, setLoginDropdown] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);

  const navItems = [
    { label: "Home", icon: <Home className="w-4 h-4" />, href: "#home" },
    { label: "Academics", icon: <BookOpen className="w-4 h-4" />, href: "#academics" },
    { label: "Activities", icon: <UsersRound className="w-4 h-4" />, href: "#activities" },
    { label: "Gallery", icon: <GalleryHorizontal className="w-4 h-4" />, href: "#gallery" },
    { label: "Contact", icon: <PhoneCall className="w-4 h-4" />, href: "#contact" },
  ];

  const handleMobileToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setAboutDropdown(false);
    setLoginDropdown(false);
  };

  const handleAboutToggle = () => {
    setAboutDropdown(!aboutDropdown);
    setLoginDropdown(false);
  };

  const handleLoginToggle = () => {
    setLoginDropdown(!loginDropdown);
    setAboutDropdown(false);
  };

  return (
    <nav className="fixed w-full z-50 backdrop-blur-md bg-white shadow-md dark:bg-gray-900 dark:text-white">
      <div className="flex justify-between items-center px-4 md:px-8 py-4 max-w-7xl mx-auto">
        <a href="#home">
          <img src={logo} alt="VIDHYARDHI" className="w-32 md:w-36 hover:scale-105 transition-transform" />
        </a>

        {/* Desktop Navigation */}
        <ul
          onMouseLeave={() => setHoveredIndex(0)}
          className="relative hidden md:flex items-center gap-6 font-medium text-purple-900 dark:text-white"
        >
          {navItems.map((item, index) => (
            <li
              key={item.label}
              className="relative"
              onMouseEnter={() => setHoveredIndex(index)}
            >
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    layoutId="nav-bubble"
                    className="absolute inset-0 rounded-full bg-lime-500 z-0"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </AnimatePresence>
              <a
                href={item.href}
                className="relative z-10 flex items-center gap-1 px-4 py-2 rounded-full transition-colors duration-300"
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            </li>
          ))}

          {/* About Dropdown with Bubble */}
          <li
            className="relative"
            onMouseEnter={() => setHoveredIndex(navItems.length)}
            onMouseLeave={() => setHoveredIndex(0)}
          >
            <AnimatePresence>
              {hoveredIndex === navItems.length && (
                <motion.div
                  layoutId="nav-bubble"
                  className="absolute inset-0 rounded-full bg-lime-500 z-0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </AnimatePresence>
            <button
              onClick={handleAboutToggle}
              className="relative z-10 nav-bubble flex items-center gap-1 px-4 py-2 rounded-full transition"
            >
              <UsersRound className="w-4 h-4" />
              <span>About</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${aboutDropdown ? "rotate-180" : ""}`} />
            </button>
            {aboutDropdown && (
              <ul className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 w-52 z-50">
                <li>
                  <a href="/pages/about/about-school.html" className="nav-bubble block px-4 py-2">
                    <span>About School</span>
                  </a>
                </li>
                <li>
                  <a href="/pages/about/about-staff.html" className="nav-bubble block px-4 py-2">
                    <span>About Staff</span>
                  </a>
                </li>
                <li>
                  <a href="/pages/about/about-academics.html" className="nav-bubble block px-4 py-2">
                    <span>About Academics</span>
                  </a>
                </li>
              </ul>
            )}
          </li>

          {/* Login Button */}
          <li>
            <motion.div
              whileHover={{ scale: [1, 1.2, 0.9, 1.05, 1] }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ display: "inline-block" }}
            >
              <LoginButton />
            </motion.div>
          </li>
        </ul>

        {/* Mobile Menu Toggle */}
        <button onClick={handleMobileToggle} className="md:hidden focus:outline-none">
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-purple-900 dark:text-white" />
          ) : (
            <Menu className="w-6 h-6 text-purple-900 dark:text-white" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 px-6 py-4 space-y-4 shadow-md rounded-b-xl">
          {/* Login Dropdown */}
          <div>
            <button
              onClick={handleLoginToggle}
              className="flex items-center justify-between w-full text-purple-900 dark:text-white"
            >
              <span className="flex items-center gap-2">
                <User2 className="w-4 h-4" /> Login
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${loginDropdown ? "rotate-180" : ""}`} />
            </button>
            {loginDropdown && (
              <ul className="pl-4 mt-2 space-y-2 text-sm">
                <li><a href="/login/admin" className="nav-bubble block"><span>Admin</span></a></li>
                <li><a href="/login/staff" className="nav-bubble block"><span>Staff</span></a></li>
                <li><a href="/login/student" className="nav-bubble block"><span>Student</span></a></li>
              </ul>
            )}
          </div>

          {/* Nav Items */}
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="nav-bubble flex items-center gap-2 text-purple-900 dark:text-white"
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}

          {/* About Dropdown */}
          <div>
            <button
              onClick={handleAboutToggle}
              className="flex items-center justify-between w-full text-purple-900 dark:text-white"
            >
              <span className="flex items-center gap-2">
                <UsersRound className="w-4 h-4" /> About
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${aboutDropdown ? "rotate-180" : ""}`} />
            </button>
            {aboutDropdown && (
              <ul className="pl-4 mt-2 space-y-2 text-sm">
                <li><a href="/pages/about/about-school.html" className="nav-bubble block"><span>About School</span></a></li>
                <li><a href="/pages/about/about-staff.html" className="nav-bubble block"><span>About Staff</span></a></li>
                <li><a href="/pages/about/about-academics.html" className="nav-bubble block"><span>About Academics</span></a></li>
              </ul>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
