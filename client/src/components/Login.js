import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  TextField, Button, Typography, Box, CircularProgress, Snackbar, Alert, Fade,
} from '@mui/material';
import { styled } from '@mui/system';
import videoBackground from '../assets/comptrack.mp4'; 


const PageContainer = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%)',
});

const FormCard = styled(Box)({
  background: 'rgba(255, 255, 255, 0.95)',
  padding: '40px',
  borderRadius: '20px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
  width: '100%',
  maxWidth: '450px',
  textAlign: 'center',
  transition: 'all 0.3s ease',
  '&:hover': { boxShadow: '0 15px 50px rgba(0, 0, 0, 0.3)' },
});

const ActionButton = styled(Button)({
  padding: '12px 24px',
  borderRadius: '25px',
  fontWeight: '600',
  background: '#00d4ff',
  color: '#fff',
  '&:hover': { background: '#00b8d4', transform: 'scale(1.05)' },
  transition: 'all 0.2s ease',
});

const LinkText = styled(Button)({
  color: '#00d4ff',
  fontWeight: '500',
  textTransform: 'none',
  '&:hover': { color: '#00b8d4', textDecoration: 'underline' },
});

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const resetForm = () => {
    setEmail('');
    setUsername('');
    setPassword('');
    setOtp('');
    setError('');
    setOtpSent(false);
    setIsForgotPassword(false);
  };

  const handleSendOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/send-otp', { email });
      setOtpSent(true);
      setSuccess('OTP generated! Check server terminal or use 123456 for testing.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { username, email, password, otp });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
      setSuccess('Registered successfully! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
      setSuccess('Logged in successfully! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/send-otp', { email });
      setSuccess('Reset OTP generated! Check server terminal or use 123456.');
      setTimeout(() => resetForm(), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate reset OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <video autoPlay loop muted style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', zIndex: -1, opacity: 0.3 }}>
        <source src={videoBackground} type="video/mp4" />
      </video>
      <Fade in={true} timeout={500}>
        <FormCard sx={{ zIndex: 1 }}>
          <Typography variant="h4" sx={{ color: '#0d1b2a', fontWeight: 'bold', mb: 4, textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
            {isForgotPassword ? 'Reset Password' : isRegister ? 'Sign Up' : 'Sign In'}
          </Typography>

          {isForgotPassword ? (
            <>
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{ mb: 3 }}
                error={!!error && error.includes('email')}
              />
              <ActionButton fullWidth onClick={handleForgotPassword} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset OTP'}
              </ActionButton>
              <Typography sx={{ mt: 3 }}>
                Back to{' '}
                <LinkText onClick={() => { setIsForgotPassword(false); setError(''); }}>
                  Sign In
                </LinkText>
              </Typography>
            </>
          ) : (
            <>
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{ mb: 3 }}
                error={!!error && error.includes('email')}
              />
              {isRegister && (
                <TextField
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 3 }}
                  error={!!error && error.includes('Username')}
                />
              )}
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{ mb: 3 }}
                error={!!error && error.includes('Password')}
              />
              {isRegister && otpSent && (
                <TextField
                  label="Enter OTP (or 123456 for testing)"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 3 }}
                />
              )}

              {error && <Typography sx={{ color: '#ff5722', mb: 2 }}>{error}</Typography>}

              {isRegister ? (
                otpSent ? (
                  <ActionButton fullWidth onClick={handleRegister} disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                  </ActionButton>
                ) : (
                  <ActionButton fullWidth onClick={handleSendOtp} disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
                  </ActionButton>
                )
              ) : (
                <ActionButton fullWidth onClick={handleLogin} disabled={loading}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </ActionButton>
              )}

              <Typography sx={{ mt: 3 }}>
                {isRegister ? 'Already have an account?' : 'New to CompTrack?'}{' '}
                <LinkText onClick={() => { setIsRegister(!isRegister); resetForm(); }}>
                  {isRegister ? 'Sign In' : 'Sign Up'}
                </LinkText>
              </Typography>
              {!isRegister && (
                <Typography sx={{ mt: 2 }}>
                  <LinkText onClick={() => { setIsForgotPassword(true); setError(''); }}>
                    Forgot Password?
                  </LinkText>
                </Typography>
              )}
            </>
          )}
        </FormCard>
      </Fade>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default Login;