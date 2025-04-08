import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Button, Typography, Container, Box, Grid, Card, TextField, Select, MenuItem,
  CssBaseline, Switch, Fade, Slide, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, Avatar, IconButton, Chip, Paper,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Edit, Brightness4, Brightness7, Logout, Refresh, Delete, CheckCircle, Comment } from '@mui/icons-material';
import logo from './assets/comptrackLogo.png';

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [authData, setAuthData] = useState({ user: null, token: null, loading: true });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [profileDialog, setProfileDialog] = useState(false);
  const [editProfile, setEditProfile] = useState({ username: '', email: '', password: '' });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [commentDialog, setCommentDialog] = useState({ open: false, complaintId: null, comment: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#00d4ff' }, // Vibrant cyan
      secondary: { main: '#ff4081' }, // Pink accent
      background: { default: darkMode ? '#0d1b2a' : '#e0f7fa' }, // Modern gradient-ready
    },
    typography: { fontFamily: 'Poppins, sans-serif' },
    components: {
      MuiCard: {
        styleOverrides: { root: { borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' } },
      },
      MuiButton: {
        styleOverrides: { root: { borderRadius: 20, textTransform: 'none', padding: '10px 20px' } },
      },
    },
  });

  const fetchComplaints = useCallback(async (userId, token, role) => {
    try {
      const endpoint = role === 'user' ? `/api/complaints/${userId}` : '/api/complaints/all';
      const res = await axios.get(`https://comptrack.onrender.com${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data);
    } catch (error) {
      showMessage(`Failed to load complaints: ${error.response?.data?.message || 'Network error'}`, 'error');
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (!storedUser || !storedToken) {
      setAuthData({ user: null, token: null, loading: false });
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setAuthData({ user: parsedUser, token: storedToken, loading: false });
      setEditProfile({ username: parsedUser.username || '', email: parsedUser.email || '', password: '' });
      fetchComplaints(parsedUser.userId, storedToken, parsedUser.role);
    } catch (error) {
      console.error('Error parsing user data:', error);
      setAuthData({ user: null, token: null, loading: false });
      navigate('/login');
    }
  }, [navigate, fetchComplaints]);

  const handleSubmit = async () => {
    if (!authData.user || !authData.token) return;
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('urgency', urgency);
      formData.append('location', location);
      if (image) formData.append('image', image);

      const res = await axios.post('https://comptrack.onrender.com/api/complaints', formData, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      showMessage(`Complaint filed! Number: ${res.data.complaintNumber}`, 'success');
      setTitle('');
      setDescription('');
      setCategory('');
      setUrgency('');
      setLocation('');
      setImage(null);
      fetchComplaints(authData.user.userId, authData.token, authData.user.role);
    } catch (error) {
      showMessage(`Failed to submit: ${error.response?.data?.message || 'Network error'}`, 'error');
    }
  };

  const handleResolve = async (id) => {
    try {
      const res = await axios.put(`https://comptrack.onrender.com/api/complaints/${id}/resolve`, {}, {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      showMessage(res.data.message, 'success');
      fetchComplaints(authData.user.userId, authData.token, authData.user.role);
    } catch (error) {
      showMessage(`Failed to resolve: ${error.response?.data?.message || 'Network error'}`, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`https://comptrack.onrender.com/api/complaints/${id}`, {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      showMessage(res.data.message, 'success');
      fetchComplaints(authData.user.userId, authData.token, authData.user.role);
    } catch (error) {
      showMessage(`Failed to delete: ${error.response?.data?.message || 'Network error'}`, 'error');
    }
  };

  const handleAssign = async (id) => {
    try {
      const res = await axios.put(`https://comptrack.onrender.com/api/complaints/${id}/assign`, {}, {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      showMessage(res.data.message, 'success');
      fetchComplaints(authData.user.userId, authData.token, authData.user.role);
    } catch (error) {
      showMessage(`Failed to assign: ${error.response?.data?.message || 'Network error'}`, 'error');
    }
  };

  const handleComment = async () => {
    try {
      const res = await axios.put(
        `https://comptrack.onrender.com/api/complaints/${commentDialog.complaintId}/comment`,
        { comment: commentDialog.comment },
        { headers: { Authorization: `Bearer ${authData.token}` } }
      );
      showMessage(res.data.message, 'success');
      setCommentDialog({ open: false, complaintId: null, comment: '' });
      fetchComplaints(authData.user.userId, authData.token, authData.user.role);
    } catch (error) {
      showMessage(`Failed to comment: ${error.response?.data?.message || 'Network error'}`, 'error');
    }
  };

  const handleProfileUpdate = async () => {
    if (!authData.user || !authData.token) return;
    try {
      const res = await axios.put(
        `https://comptrack.onrender.com/api/users/${authData.user.userId}`,
        editProfile,
        { headers: { Authorization: `Bearer ${authData.token}` } }
      );
      const updatedUser = { ...authData.user, ...res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAuthData({ ...authData, user: updatedUser });
      setProfileDialog(false);
      showMessage('Profile updated successfully!', 'success');
    } catch (error) {
      showMessage(`Failed to update profile: ${error.response?.data?.message || 'Network error'}`, 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!authData.user || !authData.token) return;
    try {
      await axios.delete(`https://comptrack.onrender.com/api/users/${authData.user.userId}`, {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setDeleteDialog(false);
      navigate('/login');
      showMessage('Account deleted successfully!', 'success');
    } catch (error) {
      showMessage(`Failed to delete account: ${error.response?.data?.message || 'Network error'}`, 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setLogoutDialogOpen(false);
    navigate('/');
    showMessage('Logged out successfully!', 'success');
  };

  const showMessage = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: '', severity: 'info' });
  };

  if (authData.loading) {
    return <Typography sx={{ color: 'white', textAlign: 'center', mt: 5 }}>Loading...</Typography>;
  }

  if (!authData.user || !authData.token) {
    return null;
  }

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          position: 'relative',
          overflowX: 'hidden',
          background: darkMode
            ? 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%)' // Modern gradient for dark mode
            : 'linear-gradient(135deg, #e0f7fa 0%, #ffffff 100%)', // Modern gradient for light mode
        }}
      >
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            bgcolor: 'rgba(27, 38, 59, 0.9)',
            zIndex: 10,
            py: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Container>
            <Grid container alignItems="center" justifyContent="space-between">
              {/* Logo and Title */}
              <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'center', sm: 'left' }, mb: { xs: 2, sm: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  <img src={logo} alt="CompTrack Logo" style={{ height: 40, marginRight: 10 }} />
                  <Typography variant="h6" sx={{ color: '#00d4ff', fontWeight: 600 }}>
                    Dashboard ({authData.user.role.charAt(0).toUpperCase() + authData.user.role.slice(1)})
                  </Typography>
                </Box>
              </Grid>

              {/* Buttons */}
              <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-end' }, flexWrap: 'wrap', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    sx={{ color: '#00d4ff', borderColor: '#00d4ff' }}
                    onClick={() => setProfileDialog(true)}
                  >
                    Profile
                  </Button>
                  <Switch
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                    icon={<Brightness7 />}
                    checkedIcon={<Brightness4 />}
                    sx={{ color: '#00d4ff' }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<Logout />}
                    sx={{
                      bgcolor: '#ff4081',
                      '&:hover': { bgcolor: '#f50057' },
                      flex: { xs: '1 1 100%', sm: 'none' }, // Full width on mobile
                    }}
                    onClick={() => setLogoutDialogOpen(true)}
                  >
                    Logout
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Container sx={{ position: 'relative', zIndex: 1, py: 8 }}>
          <Slide direction="down" in={true} timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography
                variant="h3"
                sx={{
                  color: '#fff',
                  fontWeight: 700,
                  textShadow: '0 2px 10px rgba(0, 212, 255, 0.5)',
                }}
              >
                Welcome, {authData.user.username || 'User'}! ✨
              </Typography>
              <Typography sx={{ color: '#b0bec5', fontSize: '1.2rem', mt: 1 }}>
                {authData.user.role === 'admin'
                  ? 'Oversee and resolve all issues.'
                  : authData.user.role === 'support'
                  ? 'Assist and escalate complaints.'
                  : 'File and track your concerns.'}
              </Typography>
            </Box>
          </Slide>

          {authData.user.role === 'user' && (
            <Fade in={true} timeout={1500}>
              <Card sx={{ p: 5, bgcolor: 'rgba(255, 255, 255, 0.95)', mb: 6 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 4, color: '#0d1b2a' }}>Add New Complaint</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth variant="outlined" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Select value={category} onChange={(e) => setCategory(e.target.value)} fullWidth displayEmpty>
                      <MenuItem value="" disabled>Select Category</MenuItem>
                      <MenuItem value="Water">💧 Water</MenuItem>
                      <MenuItem value="Electricity">⚡ Electricity</MenuItem>
                      <MenuItem value="Dust">🌪️ Dust</MenuItem>
                      <MenuItem value="Seating">🪑 Seating</MenuItem>
                      <MenuItem value="Other">🔧 Other</MenuItem>
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Select value={urgency} onChange={(e) => setUrgency(e.target.value)} fullWidth displayEmpty>
                      <MenuItem value="" disabled>Select Urgency</MenuItem>
                      <MenuItem value="Low">🟢 Low</MenuItem>
                      <MenuItem value="Medium">🟡 Medium</MenuItem>
                      <MenuItem value="High">🔴 High</MenuItem>
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} fullWidth variant="outlined" />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={4} variant="outlined" />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mb: 1, color: '#0d1b2a' }}>Upload Image (Optional):</Typography>
                    <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} style={{ margin: '10px 0' }} />
                  </Grid>
                  <Grid item xs={12} sx={{ textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      disabled={!title || !description || !category || !urgency || !location}
                    >
                      Submit Complaint
                    </Button>
                  </Grid>
                </Grid>
              </Card>
            </Fade>
          )}

          <Fade in={true} timeout={1500}>
            <Grid container spacing={3} sx={{ mb: 6 }}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ p: 4, bgcolor: 'rgba(255, 255, 255, 0.95)', textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#0d1b2a' }}>Total Complaints</Typography>
                  <Typography variant="h4" sx={{ color: '#00d4ff' }}>{totalComplaints}</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ p: 4, bgcolor: 'rgba(255, 255, 255, 0.95)', textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#0d1b2a' }}>Resolved Complaints</Typography>
                  <Typography variant="h4" sx={{ color: '#00c853' }}>{resolvedComplaints}</Typography>
                </Card>
              </Grid>
            </Grid>
          </Fade>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 600 }}>
              {authData.user.role === 'user' ? 'Your Complaints' : 'All Complaints'}
            </Typography>
            <IconButton onClick={() => fetchComplaints(authData.user.userId, authData.token, authData.user.role)} sx={{ color: '#00d4ff' }}>
              <Refresh />
            </IconButton>
          </Box>
          {complaints.length === 0 ? (
            <Typography sx={{ color: '#b0bec5', textAlign: 'center' }}>
              {authData.user.role === 'user' ? 'No complaints found. Add one above!' : 'No complaints available.'}
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {complaints.map((complaint) => (
                <Grid item xs={12} sm={6} md={4} key={complaint._id}>
                  <Fade in={true} timeout={500}>
                    <Card sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.95)', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#0d1b2a' }}>{complaint.title}</Typography>
                      <Typography sx={{ color: '#546e7a', mb: 1 }}>{complaint.description}</Typography>
                      <Typography sx={{ color: '#78909c' }}>Complaint #: {complaint.complaintNumber}</Typography>
                      <Typography sx={{ color: '#78909c' }}>Category: {complaint.category}</Typography>
                      <Typography sx={{ color: '#78909c' }}>Urgency: {complaint.urgency}</Typography>
                      <Typography sx={{ color: '#78909c' }}>Location: {complaint.location}</Typography>
                      {complaint.imageUrl && <img src={complaint.imageUrl} alt="Complaint" style={{ maxWidth: '100%', marginTop: '10px', borderRadius: 8 }} />}
                      <Chip
                        label={complaint.status}
                        color={complaint.status === 'Resolved' ? 'success' : 'warning'}
                        sx={{ mt: 2 }}
                      />
                      {complaint.assignedTo && <Typography sx={{ color: '#78909c', mt: 1 }}>Assigned To: {complaint.assignedTo}</Typography>}
                      {complaint.comments && complaint.comments.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography sx={{ color: '#0d1b2a', fontWeight: 500 }}>Comments:</Typography>
                          {complaint.comments.map((c, idx) => (
                            <Paper key={idx} sx={{ p: 1, mt: 1, bgcolor: '#e0f7fa' }}>
                              <Typography sx={{ color: '#0d1b2a' }}>{c.text} <em>(by Support, {new Date(c.date).toLocaleDateString()})</em></Typography>
                            </Paper>
                          ))}
                        </Box>
                      )}
                      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {authData.user.role === 'admin' && complaint.status !== 'Resolved' && (
                          <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => handleResolve(complaint._id)} sx={{ flex: '1 1 auto' }}>
                            Resolve
                          </Button>
                        )}
                        {authData.user.role === 'admin' && (
                          <Button variant="outlined" color="error" startIcon={<Delete />} onClick={() => handleDelete(complaint._id)} sx={{ flex: '1 1 auto' }}>
                            Delete
                          </Button>
                        )}
                        {authData.user.role === 'support' && !complaint.assignedTo && (
                          <Button variant="contained" color="secondary" onClick={() => handleAssign(complaint._id)} sx={{ flex: '1 1 auto' }}>
                            Assign to Admin
                          </Button>
                        )}
                        {authData.user.role === 'support' && (
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<Comment />}
                            onClick={() => setCommentDialog({ open: true, complaintId: complaint._id, comment: '' })}
                            sx={{ flex: '1 1 auto' }}
                          >
                            Comment
                          </Button>
                        )}
                      </Box>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>

        <Dialog open={profileDialog} onClose={() => setProfileDialog(false)}>
          <DialogTitle sx={{ bgcolor: '#00d4ff', color: 'white' }}>Manage Your Account</DialogTitle>
          <DialogContent sx={{ bgcolor: '#e0f7fa', py: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Avatar sx={{ width: 100, height: 100, bgcolor: '#00d4ff', fontSize: '2.5rem' }}>
                {authData.user.username ? authData.user.username[0] : 'U'}
              </Avatar>
            </Box>
            <TextField
              label="Username"
              value={editProfile.username}
              onChange={(e) => setEditProfile({ ...editProfile, username: e.target.value })}
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="Email"
              value={editProfile.email}
              onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="New Password (optional)"
              type="password"
              value={editProfile.password}
              onChange={(e) => setEditProfile({ ...editProfile, password: e.target.value })}
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              sx={{ mt: 3 }}
              onClick={() => setDeleteDialog(true)}
            >
              Delete Account
            </Button>
          </DialogContent>
          <DialogActions sx={{ bgcolor: '#e0f7fa' }}>
            <Button onClick={() => setProfileDialog(false)} color="error">Cancel</Button>
            <Button onClick={handleProfileUpdate} color="primary">Save</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle sx={{ bgcolor: '#ff4081', color: 'white' }}>Confirm Account Deletion</DialogTitle>
          <DialogContent sx={{ bgcolor: '#e0f7fa', py: 3 }}>
            <Typography>Are you sure you want to delete your account? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions sx={{ bgcolor: '#e0f7fa' }}>
            <Button onClick={() => setDeleteDialog(false)} color="primary">Cancel</Button>
            <Button onClick={handleDeleteAccount} color="error">Delete</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
          <DialogTitle sx={{ bgcolor: '#00d4ff', color: 'white' }}>Confirm Logout</DialogTitle>
          <DialogContent sx={{ bgcolor: '#e0f7fa', py: 3 }}>
            <Typography>Are you sure you want to log out?</Typography>
          </DialogContent>
          <DialogActions sx={{ bgcolor: '#e0f7fa' }}>
            <Button onClick={() => setLogoutDialogOpen(false)} color="primary">Cancel</Button>
            <Button onClick={handleLogout} color="error">Logout</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={commentDialog.open} onClose={() => setCommentDialog({ open: false, complaintId: null, comment: '' })}>
          <DialogTitle sx={{ bgcolor: '#00d4ff', color: 'white' }}>Add Comment</DialogTitle>
          <DialogContent sx={{ bgcolor: '#e0f7fa', py: 3 }}>
            <TextField
              label="Comment"
              value={commentDialog.comment}
              onChange={(e) => setCommentDialog({ ...commentDialog, comment: e.target.value })}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions sx={{ bgcolor: '#e0f7fa' }}>
            <Button onClick={() => setCommentDialog({ open: false, complaintId: null, comment: '' })} color="error">Cancel</Button>
            <Button onClick={handleComment} color="primary" disabled={!commentDialog.comment}>Submit</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;