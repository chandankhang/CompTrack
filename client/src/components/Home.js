import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Button, Typography, Container, Box, Grid, Card, AppBar, Toolbar, IconButton,
  CssBaseline, Switch, Fade, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Snackbar, Alert, Select, MenuItem, CircularProgress, Avatar, Tooltip,
  Drawer, List, ListItem, ListItemText, Divider,
} from '@mui/material';
import {
  FileCopy, TrackChanges, SupportAgent, Security, Chat, Facebook, Twitter, LinkedIn,
  Brightness4, Brightness7 , Close, Info,  Menu as MenuIcon
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import logo from './assets/comptrackLogo.png'; // Ensure this path is correct

const Home = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [complaintId, setComplaintId] = useState('');
  const [complaintStatus, setComplaintStatus] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const trackComplaintRef = useRef(null);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#4CAF50' }, // Primary color
      secondary: { main: '#FF9800' }, // Secondary color
      background: { default: darkMode ? '#121212' : '#FAFAFA' },
    },
    typography: { fontFamily: "'Poppins', sans-serif" },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 30,
            textTransform: 'none',
            padding: '14px 28px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)', // Slight zoom-in effect
              boxShadow: '0 12px 30px rgba(0,0,0,0.25)', // Enhanced shadow
            },
          },
          containedPrimary: {
            backgroundColor: '#4CAF50', // Button color
            '&:hover': {
              backgroundColor: '#388E3C', // Hover color
              boxShadow: '0 8px 20px rgba(56, 142, 60, 0.5)', // Green glow
            },
          },
          outlinedPrimary: {
            borderColor: '#4CAF50',
            color: '#4CAF50',
            '&:hover': {
              borderColor: '#388E3C',
              color: '#388E3C',
              backgroundColor: 'rgba(56, 142, 60, 0.1)', // Light green background on hover
            },
          },
          containedSecondary: {
            backgroundColor: '#FF9800', // Secondary button color
            '&:hover': {
              backgroundColor: '#F57C00', // Hover color
              boxShadow: '0 8px 20px rgba(245, 124, 0, 0.5)', // Orange glow
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            transition: 'transform 0.4s ease, box-shadow 0.4s ease',
            '&:hover': {
              transform: 'scale(1.05)', // Slight zoom-in effect
              boxShadow: '0 15px 40px rgba(76, 175, 80, 0.5)', // Green glow
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(10px)', // Modern blur effect
            backgroundColor: darkMode ? 'rgba(18, 18, 18, 0.9)' : 'rgba(255, 255, 255, 0.9)', // Transparent app bar
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            boxShadow: '0 10px 50px rgba(0,0,0,0.25)',
            backgroundColor: darkMode ? '#1E1E1E' : '#FFFFFF', // Modern dialog background
          },
        },
      },
    },
  });

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    fade: true,
    pauseOnHover: true,
  };

  const isLoggedIn = !!localStorage.getItem('user');

  const translations = {
    English: {
      title: 'Resolve Complaints, Globally',
      subtitle: 'A premium platform trusted by millions to solve issues effortlessly.',
      whyStandOut: 'Why CompTrack Excels',
      tools: 'Powerful Tools for You',
      track: 'Track Your Complaint',
      testimonials: 'User Testimonials',
      chat: 'AI-Powered Chat',
      welcome: 'Welcome to CompTrack!',
      welcomeText: 'Join millions in resolving issues seamlessly with our cutting-edge platform.',
      status: 'Status',
      complaintNumber: 'Complaint #',
      titleField: 'Title',
      createdAt: 'Filed On',
      resolvedAt: 'Resolved On',
      quotes: [
        { quote: "Resolved my issue in hours!", name: "John Doe, USA" },
        { quote: "One-stop solution for complaints!", name: "Ronny, Nepal" },
        { quote: "Best platform for complaints!", name: "Rahul Kumar, India" },
        { quote: "AI support is fantastic!", name: "Alex Z., Brazil" },
        { quote: "Quick and efficient service!", name: "Maria S., Italy" },
        { quote: "User-friendly interface!", name: "Sofia L., Greece" },
        { quote: "Highly recommend this platform!", name: "Liam O., Ireland" },
        { quote: "Premium service, worth it!", name: "Carlos M., Spain" },
      ],
    },
    Hindi: {
      title: 'शिकायतें हल करें, वैश्विक स्तर पर',
      subtitle: 'एक प्रीमियम मंच जिस पर लाखों लोग भरोसा करते हैं।',
      whyStandOut: 'कंपट्रैक क्यों उत्कृष्ट है',
      tools: 'आपके लिए शक्तिशाली उपकरण',
      track: 'अपनी शिकायत ट्रैक करें',
      testimonials: 'उपयोगकर्ता प्रशंसापत्र',
      chat: 'एआई-संचालित चैट',
      welcome: 'कंपट्रैक में आपका स्वागत है!',
      welcomeText: 'हमारे अत्याधुनिक मंच के साथ लाखों लोगों के साथ अपनी समस्याओं का समाधान करें।',
      status: 'स्थिति',
      complaintNumber: 'शिकायत संख्या',
      titleField: 'शीर्षक',
      createdAt: 'दायर किया गया',
      resolvedAt: 'हल किया गया',
      quotes: [
        { quote: "मेरी समस्या कुछ घंटों में हल हो गई!", name: "जॉन डो, अमेरिका" },
        { quote: "शिकायतों के लिए एकमात्र समाधान!", name: "रोनी, नेपाल" },
        { quote: "शिकायतों के लिए सबसे अच्छा मंच!", name: "राहुल कुमार, भारत" },
        { quote: "एआई समर्थन शानदार है!", name: "एलेक्स जेड., ब्राजील" },
        { quote: "त्वरित और कुशल सेवा!", name: "मारिया एस., इटली" },
        { quote: "उपयोगकर्ता के अनुकूल इंटरफ़ेस!", name: "सोफिया एल., ग्रीस" },
        { quote: "इस मंच की अत्यधिक सिफारिश की जाती है!", name: "लियाम ओ., आयरलैंड" },
        { quote: "प्रीमियम सेवा, इसके लायक!", name: "कार्लोस एम., स्पेन" },
      ],
    },
    Nepali: {
      title: 'शिकायतहरू समाधान गर्नुहोस्, विश्वव्यापी रूपमा',
      subtitle: 'एक प्रिमियम प्लेटफर्म जसमा लाखौंले विश्वास गर्छन्।',
      whyStandOut: 'कम्पट्र्याक किन उत्कृष्ट छ',
      tools: 'तपाईंको लागि शक्तिशाली उपकरणहरू',
      track: 'आफ्नो उजुरी ट्र्याक गर्नुहोस्',
      testimonials: 'प्रयोगकर्ता प्रशंसापत्र',
      chat: 'एआई-संचालित च्याट',
      welcome: 'कम्पट्र्याकमा तपाईंलाई स्वागत छ!',
      welcomeText: 'हाम्रो अत्याधुनिक प्लेटफर्मको साथ लाखौं व्यक्तिहरूसँग समस्याहरू समाधान गर्नुहोस्।',
      status: 'स्थिति',
      complaintNumber: 'शिकायत संख्या',
      titleField: 'शीर्षक',
      createdAt: 'दायर गरिएको',
      resolvedAt: 'समाधान गरिएको',
      quotes: [
        { quote: "मेरो समस्या केही घण्टामा समाधान भयो!", name: "जोन डो, अमेरिका" },
        { quote: "शिकायतहरूको लागि एकमात्र समाधान!", name: "रोनी, नेपाल" },
        { quote: "शिकायतहरूको लागि सबैभन्दा राम्रो प्लेटफर्म!", name: "राहुल कुमार, भारत" },
        { quote: "एआई समर्थन शानदार छ!", name: "एलेक्स जेड., ब्राजील" },
        { quote: "छिटो र प्रभावकारी सेवा!", name: "मारिया एस., इटाली" },
        { quote: "उपयोगकर्ता मैत्री इन्टरफेस!", name: "सोफिया एल., ग्रीस" },
        { quote: "यस प्लेटफर्मको अत्यधिक सिफारिश गरिन्छ!", name: "लियाम ओ., आयरलैंड" },
        { quote: "प्रीमियम सेवा, यसको लागि योग्य!", name: "कार्लोस एम., स्पेन" },
      ],
    },
    Maithili: {
      title: 'शिकायत सभ केँ समाधान करू, विश्व स्तर पर',
      subtitle: 'एक प्रीमियम प्लेटफार्म जकरा लाखों लोकनि द्वारा विश्वास कएल गेल अछि।',
      whyStandOut: 'कम्पट्रैक किएक उत्कृष्ट अछि',
      tools: 'अपने लेल शक्तिशाली उपकरण सभ',
      track: 'अपना शिकायत केँ ट्रैक करू',
      testimonials: 'हमर उपयोगकर्ता प्रशंसापत्र',
      chat: 'एआई-संचालित च्याट',
      welcome: 'कम्पट्रैक मे अपने केँ स्वागत अछि!',
      welcomeText: 'हमर अत्याधुनिक प्लेटफार्म संग लाखों लोकनि के संग समस्या सभ केँ समाधान करू।',
      status: 'स्थिति',
      complaintNumber: 'शिकायत संख्या',
      titleField: 'शीर्षक',
      createdAt: 'दायर कएल गेल',
      resolvedAt: 'समाधान कएल गेल',
      quotes: [
        { quote: "हमर समस्या किछु घंटा मे समाधान भऽ गेल!", name: "जोन डो, अमेरिका" },
        { quote: "शिकायत सभक लेल एकमात्र समाधान!", name: "रोनी, नेपाल" },
        { quote: "शिकायत सभक लेल सर्वश्रेष्ठ प्लेटफार्म!", name: "राहुल कुमार, भारत" },
        { quote: "एआई समर्थन अद्भुत अछि!", name: "एलेक्स जेड., ब्राजील" },
        { quote: "त्वरित आ प्रभावकारी सेवा!", name: "मारिया एस., इटली" },
        { quote: "उपयोगकर्ता-मित्रता इंटरफेस!", name: "सोफिया एल., ग्रीस" },
        { quote: "ई प्लेटफार्म के अत्यधिक सिफारिश कएल जाइत अछि!", name: "लियाम ओ., आयरलैंड" },
        { quote: "प्रीमियम सेवा, ई योग्य अछि!", name: "कार्लोस एम., स्पेन" },
      ],
    },
  };

  

  const handleChatSubmit = async () => {
    if (!chatMessage.trim()) {
      setChatHistory([...chatHistory, { user: chatMessage, ai: 'Please enter a valid message!' }]);
      return;
    }
    setChatLoading(true);
    try {
      const response = await axios.post('https://comptrack.onrender.com/api/chat', { message: chatMessage });
      const newMessage = { user: chatMessage, ai: response.data.reply || 'How can I assist you today?' };
      setChatHistory([...chatHistory, newMessage]);
    } catch (error) {
      setChatHistory([...chatHistory, { user: chatMessage, ai: 'Oops! Something went wrong. Please try again.' }]);
    } finally {
      setChatLoading(false);
      setChatMessage('');
    }
  };

  const handleTrackComplaint = async () => {
    if (!complaintId.trim()) {
      setSnackbar({ open: true, message: 'Please enter a Complaint ID.', severity: 'warning' });
      return;
    }
    setChatLoading(true);
    try {
      const res = await axios.get(`https://comptrack.onrender.com/api/complaints/track/${complaintId}`);
      setComplaintStatus(res.data);
      setSnackbar({ open: true, message: 'Complaint status retrieved successfully!', severity: 'success' });
    } catch (error) {
      setComplaintStatus(null);
      setSnackbar({ open: true, message: 'Invalid Complaint ID or server error.', severity: 'error' });
    } finally {
      setChatLoading(false);
    }
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          overflowX: 'hidden',
          background: darkMode
            ? 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' // Modern dark gradient
            : 'linear-gradient(135deg, #e0f7fa, #ffffff)', // Light gradient
        }}
      >
        <AppBar
          position = "fixed"
          sx={{
            bgcolor: darkMode ? 'rgba(15, 32, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)', // Transparent app bar
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(10px)', // Modern blur effect
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img src={logo} alt="CompTrack Logo" style={{ height: 55, marginRight: 15 }} />
              <Typography
                variant="h5"
                component={Link}
                to="/"
                sx={{
                  color: darkMode ? '#81C784' : '#4CAF50',
                  textDecoration: 'none',
                  fontWeight: 700,
                  letterSpacing: 1,
                }}
              >
                CompTrack
              </Typography>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2.5 }}>
              <Button
                color="inherit"
                component={Link}
                to="/"
                sx={{
                  color: darkMode ? '#B0BEC5' : '#757575',
                  '&:hover': { color: darkMode ? '#81C784' : '#4CAF50', transform: 'scale(1.05)' },
                  transition: 'all 0.3s',
                }}
              >
                Home
              </Button>
              {isLoggedIn ? (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/dashboard"
                    sx={{
                      color: darkMode ? '#B0BEC5' : '#757575',
                      '&:hover': { color: darkMode ? '#81C784' : '#4CAF50', transform: 'scale(1.05)' },
                      transition: 'all 0.3s',
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => {
                      localStorage.clear();
                      navigate('/');
                    }}
                    sx={{
                      color: darkMode ? '#B0BEC5' : '#757575',
                      '&:hover': { color: darkMode ? '#FF9800' : '#FF9800', transform: 'scale(1.05)' },
                      transition: 'all 0.3s',
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/login"
                    sx={{
                      color: darkMode ? '#B0BEC5' : '#757575',
                      '&:hover': { color: darkMode ? '#81C784' : '#4CAF50', transform: 'scale(1.05)' },
                      transition: 'all 0.3s',
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/about"
                    sx={{
                      color: darkMode ? '#B0BEC5' : '#757575',
                      '&:hover': { color: darkMode ? '#81C784' : '#4CAF50', transform: 'scale(1.05)' },
                      transition: 'all 0.3s',
                    }}
                  >
                    About Us
                  </Button>
                </>
              )}
              <Tooltip>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  sx={{
                    color: darkMode ? '#81C784' : '#4CAF50',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    borderRadius: 2
                  }}
                >
                  <MenuItem value="English">
                   English
                  </MenuItem>
                  <MenuItem value="Hindi">
                   हिन्दी
                  </MenuItem>
                  <MenuItem value="Nepali">
                    नेपाली
                  </MenuItem>
                  <MenuItem value="Maithili">
                    मैथिली
                  </MenuItem>
                </Select>
              </Tooltip>
              <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                <Switch
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  icon={<Brightness7 sx={{ color: '#fff' }} />}
                  checkedIcon={<Brightness4 sx={{ color: '#fff' }} />}
                />
              </Tooltip>
            </Box>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ display: { xs: 'block', md: 'none' } }}
              onClick={toggleDrawer}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
          <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
            <Box sx={{ width: 250 }}>
              <IconButton onClick={toggleDrawer} sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                <Close />
              </IconButton>
              <Divider />
              <List>
                <ListItem button component={Link} to="/" onClick={toggleDrawer}>
                  <ListItemText primary="Home" />
                </ListItem>
                <ListItem button component={Link} to="/login" onClick={toggleDrawer}>
                  <ListItemText primary="Login" />
                </ListItem>
                <ListItem button component={Link} to="/about" onClick={toggleDrawer}>
                  <ListItemText primary="About Us" />
                </ListItem>
              </List>
            </Box>
          </Drawer>
        </AppBar>

        <Box
          sx={{
            position: 'relative',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            bgcolor: darkMode ? '#0f2027' : '#e0f7fa', // Updated background
            color: darkMode ? '#fff' : '#1a1a2e', // Updated text color
            px: 2,
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '6rem' },
                mb: 5,
                textShadow: '0 6px 25px rgba(0, 0, 0, 0.8)',
                letterSpacing: 2,
              }}
            >
              {translations[language].title}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 7,
                maxWidth: '1000px',
                mx: 'auto',
                fontWeight: 300,
                color: darkMode ? '#E0E0E0' : '#424242',
                letterSpacing: 1.5,
                lineHeight: 1.6,
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              }}
            >
              {translations[language].subtitle}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/login"
                sx={{
                  bgcolor: '#4CAF50',
                  '&:hover': { bgcolor: '#388E3C', transform: 'scale(1.15)' },
                  px: { xs: 3, sm: 5 },
                  py: { xs: 1.5, sm: 2 },
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/about"
                sx={{
                  color: darkMode ? '#fff' : '#4CAF50',
                  borderColor: darkMode ? '#fff' : '#4CAF50',
                  '&:hover': { borderColor: '#388E3C', color: '#388E3C', transform: 'scale(1.15)' },
                  px: { xs: 3, sm: 5 },
                  py: { xs: 1.5, sm: 2 },
                }}
              >
                Learn More
              </Button>
            </Box>
          </Container>
        </Box>

        <Container sx={{ py: { xs: 8, sm: 12, md: 15 } }} ref={trackComplaintRef}>
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontWeight: 800,
              mb: { xs: 6, md: 10 },
              color: darkMode ? '#fff' : '#1a1a2e',
              textShadow: '0 4px 15px rgba(0,0,0,0.25)',
              fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }, // Responsive font sizes
            }}
          >
            {translations[language].track}
          </Typography>
          <Box
            sx={{
              maxWidth: '800px',
              mx: 'auto',
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              p: { xs: 4, sm: 6 },
              borderRadius: 5,
              boxShadow: '0 15px 50px rgba(0,0,0,0.2)',
            }}
          >
            <TextField
              placeholder="Enter Complaint ID (e.g., COMP-123456789)"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{
                mb: 5,
                bgcolor: '#fff',
                borderRadius: 3,
                '& .MuiOutlinedInput-root': { borderRadius: 12 },
              }}
              InputProps={{
                endAdornment: (
                  <Tooltip title="Enter your complaint ID">
                    <Info sx={{ color: '#4CAF50' }} />
                  </Tooltip>
                ),
              }}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleTrackComplaint}
              sx={{
                width: '100%',
                py: { xs: 2, sm: 2.5 },
                fontSize: { xs: '1rem', sm: '1.1rem' },
                '&:hover': { transform: 'scale(1.05)' },
              }}
              disabled={chatLoading}
            >
              {chatLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Track Now'}
            </Button>
            {complaintStatus && (
              <Fade in={true} timeout={800}>
                <Box
                  sx={{
                    mt: 5,
                    p: { xs: 3, sm: 5 },
                    bgcolor: '#e6faff',
                    borderRadius: 4,
                    textAlign: 'left',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: '#1a1a2e',
                      mb: 2,
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                    }}
                  >
                    {translations[language].complaintNumber}: {complaintStatus.complaintNumber}
                  </Typography>
                  <Typography sx={{ color: '#424242', mb: 1 }}>{translations[language].titleField}: {complaintStatus.title}</Typography>
                  <Typography sx={{ color: '#424242', mb: 1 }}>
                    {translations[language].status}:{' '}
                    <span
                      style={{
                        color: complaintStatus.status === 'Resolved' ? '#00c853' : '#ff5722',
                        fontWeight: 600,
                      }}
                    >
                      {complaintStatus.status}
                    </span>
                  </Typography>
                  <Typography sx={{ color: '#424242', mb: 1 }}>{translations[language].createdAt}: {new Date(complaintStatus.createdAt).toLocaleDateString()}</Typography>
                  {complaintStatus.resolvedAt && (
                    <Typography sx={{ color: '#424242' }}>{translations[language].resolvedAt}: {new Date(complaintStatus.resolvedAt).toLocaleDateString()}</Typography>
                  )}
                </Box>
              </Fade>
            )}
          </Box>
        </Container>

        <Container sx={{ py: 16 }}>
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontWeight: 800,
              mb: 14,
              color: darkMode ? '#4CAF50' : '#1a1a2e', // Updated color
              textShadow: '0 4px 15px rgba(0,0,0,0.25)', // Subtle shadow for text
              transition: 'color 0.3s ease', // Smooth color transition
              '&:hover': {
                color: darkMode ? '#81C784' : '#388E3C', // Hover color
              },
            }}
          >
            {translations[language].whyStandOut}
          </Typography>
          <Grid container spacing={7} justifyContent="center">
            {[
              { icon: <FileCopy />, title: 'Instant Filing', desc: 'Submit complaints with AI-guided forms in seconds.' },
              { icon: <TrackChanges />, title: 'Live Tracking', desc: 'Monitor your complaint status in real-time.' },
              { icon: <SupportAgent />, title: 'AI Support', desc: 'Get 24/7 assistance from our smart AI.' },
              { icon: <Security />, title: 'Top Security', desc: 'Your data is encrypted with global standards.' },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Fade in={true} timeout={700 * (index + 1)}>
                  <Card
                    sx={{
                      p: 6,
                      textAlign: 'center',
                      bgcolor: darkMode ? '#3e3e5e' : '#fff',
                      borderRadius: 4,
                      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)', // Slight zoom-in effect
                        bgcolor: darkMode ? '#4CAF50' : '#E8F5E9', // Updated hover background color
                        color: darkMode ? '#fff' : '#1a1a2e', // Updated hover text color
                        boxShadow: '0 15px 40px rgba(76, 175, 80, 0.5)', // Green glow
                      },
                    }}
                  >
                    {React.cloneElement(feature.icon, {
                      sx: {
                        fontSize: 80,
                        color: darkMode ? '#81C784' : '#4CAF50', // Updated icon color
                        mb: 4,
                        transition: 'color 0.3s ease',
                        '&:hover': {
                          color: darkMode ? '#A5D6A7' : '#388E3C', // Hover icon color
                        },
                      },
                    })}
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                      {feature.desc}
                    </Typography>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>

        <Box sx={{ bgcolor: darkMode ? '#2e2e4e' : '#e6faff', py: 16 }}>
          <Container>
            <Typography
              variant="h3"
              align="center"
              sx={{
                fontWeight: 800,
                mb: 14,
                color: darkMode ? '#4CAF50' : '#1a1a2e', // Updated color
                textShadow: '0 4px 15px rgba(0,0,0,0.25)', // Subtle shadow for text
                transition: 'color 0.3s ease', // Smooth color transition
                '&:hover': {
                  color: darkMode ? '#81C784' : '#388E3C', // Hover color
                },
              }}
            >
              {translations[language].tools}
            </Typography>
            <Grid container spacing={7} justifyContent="center">
              <Grid item xs={12} sm={4}>
                <Card
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    bgcolor: darkMode ? '#3e3e5e' : '#fff',
                    borderRadius: 4,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)', // Slight zoom-in effect
                      bgcolor: darkMode ? '#4CAF50' : '#E8F5E9', // Updated hover background color
                      color: darkMode ? '#fff' : '#1a1a2e', // Updated hover text color
                      boxShadow: '0 15px 40px rgba(76, 175, 80, 0.5)', // Green glow
                    },
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 4, fontWeight: 700 }}>
                    {translations[language].chat}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Chat />}
                    onClick={() => setChatOpen(true)}
                    sx={{
                      py: 2,
                      px: 5,
                      bgcolor: '#4CAF50',
                      color: '#fff',
                      '&:hover': {
                        bgcolor: '#388E3C', // Updated hover color
                        boxShadow: '0 8px 20px rgba(56, 142, 60, 0.5)', // Green glow
                        transform: 'scale(1.1)', // Slight zoom-in effect
                      },
                    }}
                  >
                    Chat Now
                  </Button>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    bgcolor: darkMode ? '#3e3e5e' : '#fff',
                    borderRadius: 4,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)', // Slight zoom-in effect
                      bgcolor: darkMode ? '#4CAF50' : '#E8F5E9', // Updated hover background color
                      color: darkMode ? '#fff' : '#1a1a2e', // Updated hover text color
                      boxShadow: '0 15px 40px rgba(76, 175, 80, 0.5)', // Green glow
                    },
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 4, fontWeight: 700 }}>
                    Multi-Language
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {language} Support Enabled
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    bgcolor: darkMode ? '#3e3e5e' : '#fff',
                    borderRadius: 4,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)', // Slight zoom-in effect
                      bgcolor: darkMode ? '#4CAF50' : '#E8F5E9', // Updated hover background color
                      color: darkMode ? '#fff' : '#1a1a2e', // Updated hover text color
                      boxShadow: '0 15px 40px rgba(76, 175, 80, 0.5)', // Green glow
                    },
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 4, fontWeight: 700 }}>
                    Quick Links
                  </Typography>
                  <Button
                    variant="outlined"
                    component={Link}
                    to="/login"
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderColor: '#4CAF50',
                      color: '#4CAF50',
                      '&:hover': {
                        borderColor: '#388E3C',
                        color: '#388E3C',
                        backgroundColor: 'rgba(56, 142, 60, 0.1)', // Light green background on hover
                      },
                    }}
                  >
                    Login
                  </Button>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Dialog open={chatOpen} onClose={() => setChatOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#4CAF50', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 3 }}>
            {translations[language].chat}
            <IconButton onClick={() => setChatOpen(false)} sx={{ color: '#fff' }}><Close /></IconButton>
          </DialogTitle>
          <DialogContent sx={{ bgcolor: '#f0faff', py: 5, maxHeight: '60vh', overflowY: 'auto' }}>
            {chatHistory.map((msg, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}>
                  <Typography sx={{ p: 2, bgcolor: '#4CAF50', color: '#fff', borderRadius: 3, maxWidth: '70%' }}>{msg.user}</Typography>
                  <Avatar sx={{ ml: 2, bgcolor: '#4CAF50' }}>U</Avatar>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2, bgcolor: '#FF9800' }}>AI</Avatar>
                  <Typography sx={{ p: 2, bgcolor: '#fff', borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', maxWidth: '70%' }}>{msg.ai}</Typography>
                </Box>
              </Box>
            ))}
            {chatLoading && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CircularProgress size={35} sx={{ color: '#4CAF50' }} />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ bgcolor: '#f0faff', p: 3 }}>
            <TextField
              label="Ask me anything..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ mr: 2, bgcolor: '#fff', borderRadius: 3 }}
              onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
            />
            <Button onClick={handleChatSubmit} color="primary" variant="contained" disabled={chatLoading} sx={{ px: 5, py: 1.5 }}>Send</Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ py: 16, bgcolor: darkMode ? '#1a1a2e' : '#f0faff' }}>
          <Container>
            <Typography variant="h3" align="center" sx={{ fontWeight: 800, mb: 14, color: darkMode ? '#fff' : '#1a1a2e', textShadow: '0 4px 15px rgba(0,0,0,0.25)' }}>{translations[language].testimonials}</Typography>
            <Slider {...sliderSettings}>
              {translations[language].quotes.map((testimonial, index) => (
                <Box key={index} sx={{ textAlign: 'center', px: 8 }}>
                  <Typography variant="h5" sx={{ fontStyle: 'italic', mb: 4, color: darkMode ? '#e0e0e0' : '#424242', maxWidth: '900px', mx: 'auto', lineHeight: 1.6 }}>
                    "{testimonial.quote}"
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#4CAF50' }}>
                    — {testimonial.name}
                  </Typography>
                </Box>
              ))}
            </Slider>
          </Container>
        </Box>


        <Box sx={{ bgcolor: darkMode ? '#2e2e4e' : '#1a1a2e', py: 12, textAlign: 'center', color: '#e0e0e0', boxShadow: '0 -6px 25px rgba(0,0,0,0.2)' }}>
          <Container>
            <Typography variant="body1" sx={{ mb: 5, fontWeight: 500, letterSpacing: 1 }}>© {new Date().getFullYear()} CompTrack. All Rights Reserved.</Typography>
            <Box sx={{ mb: 5 }}>
              <IconButton href="https://www.facebook.com/" target='_blank' sx={{ color: '#4CAF50', mx: 2, '&:hover': { color: '#00c4cc', transform: 'scale(1.2)' }, transition: 'all 0.3s' }}><Facebook /></IconButton>
              <IconButton href="https://www.twitter.com/"target='_blank' sx={{ color: '#4CAF50', mx: 2, '&:hover': { color: '#00c4cc', transform: 'scale(1.2)' }, transition: 'all 0.3s' }}><Twitter /></IconButton>
              <IconButton href="https://www.linkedin.com/"target='_blank' sx={{ color: '#4CAF50', mx: 2, '&:hover': { color: '#00c4cc', transform: 'scale(1.2)' }, transition: 'all 0.3s' }}><LinkedIn /></IconButton>
            </Box>
            <Typography variant="body2" sx={{ letterSpacing: 1 }}>
              <Link href="#" style={{ color: '#4CAF50', textDecoration: 'none', mx: 2, '&:hover': { textDecoration: 'underline' } }}>Privacy</Link> |
              <Link href="#" style={{ color: '#4CAF50', textDecoration: 'none', mx: 2, '&:hover': { textDecoration: 'underline' } }}>Terms</Link> |
              <Link href="#" style={{ color: '#4CAF50', textDecoration: 'none', mx: 2, '&:hover': { textDecoration: 'underline' } }}>Contact</Link>
            </Typography>
          </Container>
        </Box>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%', boxShadow: '0 6px 20px rgba(0,0,0,0.2)', borderRadius: 8 }}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default Home;