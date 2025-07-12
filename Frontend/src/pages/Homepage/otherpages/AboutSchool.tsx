import React from "react";
import GallerySection from "../components/Gallery";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Fab,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";

const testimonials = [
  "Vidyardhi School is not just an institution—it's a second home for our children.",
  "The balance of academics and values is what makes this school truly exceptional.",
  "The environment is nurturing, modern, and constantly evolving to help kids thrive.",
  "As a parent, I’ve seen my child grow emotionally and intellectually here.",
];

const iconUrls = [
  { src: "https://cdn-icons-png.flaticon.com/512/942/942748.png", className: "top-[40px] left-[20px]" },
  { src: "https://cdn-icons-png.flaticon.com/512/3461/3461536.png", className: "top-[80px] right-[12%]" },
  { src: "https://cdn-icons-png.flaticon.com/512/2630/2630873.png", className: "bottom-[420px] left-[10%]" },
  { src: "https://cdn-icons-png.flaticon.com/512/1048/1048953.png", className: "bottom-[400px] right-[10%]" },
  { src: "https://cdn-icons-png.flaticon.com/512/3405/3405765.png", className: "bottom-[300px] right-[25%]" },
  { src: "https://cdn-icons-png.flaticon.com/512/753/753345.png", className: "top-[30%] left-[50%]" },
  { src: "https://cdn-icons-png.flaticon.com/512/166/166123.png", className: "bottom-[20%] right-[15%]" },
];

const schoolFeatures = [
  {
    title: "Quality Education",
    description: "We emphasize conceptual clarity and lifelong learning through modern teaching practices.",
  },
  {
    title: "Holistic Development",
    description: "From arts to athletics, we nurture every dimension of a student’s potential.",
  },
  {
    title: "Tech-Integrated Learning",
    description: "Smart classrooms, interactive content, and e-learning tools are part of daily instruction.",
  },
  {
    title: "Values & Ethics",
    description: "We prioritize honesty, empathy, discipline, and gratitude across all grades.",
  },
  {
    title: "Safe Campus",
    description: "With 24/7 security, friendly staff, and a positive environment, safety is assured.",
  },
  {
    title: "Dedicated Faculty",
    description: "Highly trained, caring educators who believe in the mission of shaping future leaders.",
  },
];

const AboutSchool: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #6e00c5 0%, #e34ec1 100%)",
        color: "#fff",
        pt: 8,
        px: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🧩 Decorative floating icons */}
      {iconUrls.map((icon, index) => (
        <Box
          key={index}
          component="img"
          src={icon.src}
          alt={`icon-${index}`}
          className={icon.className}
          sx={{
            position: "absolute",
            zIndex: 1,
            opacity: 0.08,
            width: { xs: 40, sm: 60, md: 80 },
            height: "auto",
          }}
        />
      ))}

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 10 }}>
        {/* 🏫 Heading */}
        <Box
          sx={{
            mb: 10,
            p: 4,
            borderRadius: "16px",
            backdropFilter: "blur(16px)",
            background: "rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
       <Typography
  variant="h2"
  sx={{
    fontFamily: '"Pacifico", cursive',
    fontWeight: 600,
    mb: 3,
    textAlign: "center",
    color: "#fff",
    textShadow: "2px 2px 8px rgba(0,0,0,0.4)",
  }}
>
  <Box component="span" sx={{ color: "#8000ff" /* purple */ }}>
    Welcome {" "}
  </Box>
  to {""}
  <Box component="span" sx={{ color: "#00cc66" /* green */ }}>
    Vidhya 
  </Box>
  <Box component="span" sx={{ color: "#ff9900" /* orange */ }}>
    rdhi{" "}
  </Box>
  school
</Typography>


          <Typography sx={{ fontSize: "1.2rem", lineHeight: 1.8, textAlign: "justify" }}>
            Founded in <strong>2025</strong>, Vidyardhi School is a vibrant educational community focused
            on nurturing minds and inspiring hearts. Our vision is to go beyond books and equip every learner
            with curiosity, courage, and compassion. With a strong foundation of ethics, creativity, and inquiry-based learning,
            Vidyardhi School helps every student uncover their best self.
          </Typography>
        </Box>

        {/* 🔥 School Features */}
        <Grid container spacing={4} sx={{ mb: 10 }}>
          {schoolFeatures.map((feature, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 5,
                  p: 3,
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  color: "#fff",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 📸 Gallery Section */}
        <Box sx={{ mb: 12 }}>
          <GallerySection />
        </Box>

        {/* 💬 Testimonials */}
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4, textAlign: "center" }}>
          What Parents Say
        </Typography>
        <Grid container spacing={4}>
          {testimonials.map((quote, idx) => (
            <Grid item xs={12} sm={6} key={idx}>
              <Card
                sx={{
                  height: "100%",
                  p: 3,
                  borderRadius: 4,
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(12px)",
                  color: "#fff",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.6)",
                  },
                }}
              >
                <CardContent>
                  <Typography variant="body1" fontStyle="italic">
                    “{quote}”
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 🏠 Home Button */}
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          backgroundColor: "#ffffff",
          color: "#a34dac",
          "&:hover": {
            backgroundColor: "#ffe4ff",
          },
        }}
        onClick={() => navigate("/")}
      >
        <HomeIcon />
      </Fab>
    </Box>
  );
};

export default AboutSchool;
