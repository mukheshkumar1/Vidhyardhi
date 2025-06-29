import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

// Assuming you have Vidyardhi logo file imported or url
import vidyardhiLogo from '@/assets/images/logo5.png';

interface SchoolImage {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
}

const AboutSchool: React.FC = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<SchoolImage[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/school-images')
      .then((res) => res.json())
      .then(setImages)
      .catch(console.error);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#a34dac',
        color: 'white',
        pt: 4,
        pb: 8,
        px: 2,
        position: 'relative',
      }}
    >
      {/* AppBar with logo top right */}
      <AppBar position="static" sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
        <Toolbar sx={{ justifyContent: 'flex-start' }}>
          <IconButton
            edge="end"
            color="inherit"
            aria-label="go home"
            onClick={() => navigate('/')}
            sx={{ p: 0 }}
          >
            <Box
              component="img"
              src={vidyardhiLogo}
              alt="Vidyardhi Logo"
              sx={{ height: 48 }}
            />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          About Vidyardhi School
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, fontSize: '1.2rem', lineHeight: 1.6 }}>
          Vidyardhi School is committed to providing quality education that balances academic excellence,
          ethical values, and environmental responsibility. Our ethos centers around integrity, respect,
          and fostering a nurturing environment where every student thrives.
        </Typography>

        <Typography variant="h5" fontWeight="medium" gutterBottom>
          Our Ethics
        </Typography>
        <Typography variant="body1" sx={{ mb: 6, fontSize: '1.1rem', lineHeight: 1.5 }}>
          We emphasize honesty, discipline, respect for others, and social responsibility. Our students
          are encouraged to become compassionate citizens who contribute positively to society.
        </Typography>

        {/* Cards section */}
        <Grid container spacing={4}>
          {images.map(({ _id, title, description, imageUrl }) => (
            <Grid item xs={12} sm={6} key={_id}>
              <Card
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                  borderRadius: 3,
                  cursor: 'default',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 6px 15px rgba(0,0,0,0.5)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={imageUrl}
                  alt={title}
                  sx={{ height: 180, objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Home button bottom center */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{ bgcolor: '#fff', color: '#a34dac', fontWeight: 'bold', px: 3, py: 1.5 }}
        >
          Home
        </Button>
      </Box>
    </Box>
  );
};

export default AboutSchool;
