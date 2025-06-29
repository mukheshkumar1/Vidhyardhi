import AboutSection from "./components/about";
import HomeSection from "./components/homeSection";
import Navbar from "./components/navbar";
import GallerySection from "./components/Gallery";
import Footer from "./components/footer";
import ActivitiesTab from "./components/activities";
import Calendar from "../Admin/components/Calender";
import ContactSection from "./components/contact";

const Homepage = () => {
  return (
    <div className= "bg-[#44701b]  min-h-screen transition-all text-gray-200"> {/* Background + padding + full height */}
      <Navbar />
      <div className="h-16" /> 
      <HomeSection/>
      <AboutSection/>
      <ActivitiesTab/>
      <Calendar/>
      <div className="my-12" />
      <GallerySection/>
      <ContactSection/>
      <div className="mt-12">
      <Footer/>
      </div>
    </div>
  );
};

export default Homepage;
