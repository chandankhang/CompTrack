import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Typography, Container, Box, AppBar, Toolbar, Button, Grid, Card, CardContent,
  TextField, IconButton, Fade
} from '@mui/material';
import { Email, Phone, Send, Facebook, Twitter, LinkedIn } from '@mui/icons-material';
import backgroundImage from "./components/assets/comptrack.png"; // Same modern background as Home.js

const About = () => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formMessage, setFormMessage] = useState('');

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Placeholder for form submission logic (backend route needed)
    setFormMessage('Thank you for reaching out! We’ll get back to you soon.');
    setContactForm({ name: '', email: '', message: '' });
  };

  return (
    <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Navbar */}
      <AppBar position="static" sx={{ bgcolor: '#2c3e50', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ fontWeight: 'bold', color: 'white', textDecoration: 'none', letterSpacing: 1 }}
          >
            CompTrack
          </Typography>
          <Box>
            <Button
              color="inherit"
              component={Link}
              to="/"
              sx={{
                textTransform: 'none',
                color: 'white',
                mr: 2,
                transition: 'color 0.3s ease',
                '&:hover': { color: '#3498db' }
              }}
            >
              Home
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/about"
              sx={{
                textTransform: 'none',
                color: 'white',
                transition: 'color 0.3s ease',
                '&:hover': { color: '#3498db' }
              }}
            >
              About Us
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <div
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.8), rgba(44, 62, 80, 0.8))', // Gradient overlay
          }}
        />
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={1000}>
            <Typography
              variant="h1"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                textShadow: '3px 3px 6px rgba(0, 0, 0, 0.4)',
                fontSize: { xs: '2.5rem', md: '4rem' },
                letterSpacing: 2
              }}
            >
              About CompTrack
            </Typography>
          </Fade>
          <Fade in timeout={1500}>
            <Typography
              variant="h5"
              sx={{
                maxWidth: '800px',
                mx: 'auto',
                textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)',
                fontSize: { xs: '1.2rem', md: '1.5rem' }
              }}
            >
              Simplifying complaint resolution with transparency, efficiency, and reliability.
            </Typography>
          </Fade>
        </Container>
      </div>

      {/* About Content */}
      <Container sx={{ py: 10 }}>
        <Box textAlign="center" mb={8}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 3 }}>
            Who We Are
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', maxWidth: '800px', mx: 'auto', fontSize: '1.1rem' }}>
            CompTrack is a cutting-edge platform designed to bridge the gap between users and service providers. Whether it's
            resolving hostel issues, public grievances, or workplace concerns, we ensure your voice is heard and your problems
            are resolved efficiently.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderRadius: 3,
                border: '1px solid #3498db',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)' },
                bgcolor: '#fff'
              }}
            >
              <CardContent sx={{ py: 4 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Email sx={{ fontSize: 40, color: '#3498db', mr: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                    Our Mission
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#7f8c8d', fontSize: '1rem' }}>
                  To empower individuals by providing a transparent and user-friendly platform to address their
                  complaints. We aim to ensure accountability and timely resolutions for all grievances.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderRadius: 3,
                border: '1px solid #3498db',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)' },
                bgcolor: '#fff'
              }}
            >
              <CardContent sx={{ py: 4 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Phone sx={{ fontSize: 40, color: '#3498db', mr: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                    Why Choose Us?
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#7f8c8d', fontSize: '1rem' }}>
                  - Seamless complaint filing experience.<br />
                  - Real-time status updates.<br />
                  - 24/7 dedicated support team.<br />
                  - Secure platform to protect your data.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Contact Section */}
      <Box sx={{ bgcolor: '#ecf0f1', py: 10 }}>
        <Container>
          <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 6 }}>
            Get in Touch
          </Typography>
          <Box maxWidth="600px" mx="auto">
            <form onSubmit={handleContactSubmit}>
              <TextField
                label="Your Name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                fullWidth
                margin="normal"
                variant="outlined"
                sx={{ bgcolor: 'white', borderRadius: 1 }}
              />
              <TextField
                label="Your Email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                fullWidth
                margin="normal"
                variant="outlined"
                sx={{ bgcolor: 'white', borderRadius: 1 }}
              />
              <TextField
                label="Your Message"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: '#3498db',
                  color: 'white',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  mt: 2,
                  px: 4,
                  py: 1.5,
                  '&:hover': { bgcolor: '#2980b9' }
                }}
                endIcon={<Send />}
              >
                Send Message
              </Button>
            </form>
            {formMessage && (
              <Typography sx={{ color: '#27ae60', mt: 2, textAlign: 'center' }}>
                {formMessage}
              </Typography>
            )}
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#2c3e50', py: 6, color: 'white', textAlign: 'center' }}>
        <Box mb={3}>
          <IconButton href="https://facebook.com" target="_blank" sx={{ color: 'white', '&:hover': { color: '#3498db' } }}>
            <Facebook />
          </IconButton>
          <IconButton href="https://twitter.com" target="_blank" sx={{ color: 'white', '&:hover': { color: '#3498db' } }}>
            <Twitter />
          </IconButton>
          <IconButton href="https://linkedin.com" target="_blank" sx={{ color: 'white', '&:hover': { color: '#3498db' } }}>
            <LinkedIn />
          </IconButton>
        </Box>
        <Typography variant="body2">
          © {new Date().getFullYear()} CompTrack. All rights reserved.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          <Link to="/" style={{ color: '#3498db', textDecoration: 'none' }}>
            Home
          </Link>{' '}
          |{' '}
          <Link to="/about" style={{ color: '#3498db', textDecoration: 'none' }}>
            About Us
          </Link>{' '}
          |{' '}
          <Link to="/contact" style={{ color: '#3498db', textDecoration: 'none' }}>
            Contact Us
          </Link>
        </Typography>
      </Box>
    </div>
  );
};

export default About;