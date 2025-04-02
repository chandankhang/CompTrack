import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Complaint from './models/complaint.js';
import authMiddleware from './middleware/authMiddleware.js';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Request logging

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.error('MongoDB Connection Failed:', err.message));

// File upload configuration
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|pdf/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only images (JPEG/PNG) and PDFs are allowed'));
  },
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  pool: true,
  maxConnections: 5,
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"CompTrack" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: `<p style="font-family: Arial, sans-serif;">${text}</p>`,
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
};

// OTP storage
const otps = new Map();

// Cleanup expired OTPs periodically
setInterval(() => {
  for (const [email, { expires }] of otps) {
    if (Date.now() > expires) otps.delete(email);
  }
}, 60 * 1000); // Every minute

// Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;

  // validate email format
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }


  // Skip OTP for admin and support emails
  if (email === process.env.ADMIN_EMAIL || email === process.env.SUPPORT_EMAIL) {
    return res.status(400).json({ message: 'OTP not required for admin/support accounts.' });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otps.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });

  console.log(`Generated OTP for ${email}: ${otp} (Valid for 5 minutes)`);

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await sendEmail(email, 'Your CompTrack OTP', `Your OTP is <b>${otp}</b>. This OTP is valid for 5 minutes.`);
      return res.json({ message: 'OTP sent to your email. Check your inbox or spam folder.' });
    }
    return res.json({ message: 'Email not configured. Use OTP from console or 123456 for testing.', otp });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send OTP email.' });
  }
});

// Register User
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, otp } = req.body;

  // Skip OTP validation for admin and support emails
  if (email === process.env.ADMIN_EMAIL || email === process.env.SUPPORT_EMAIL) {
    if (!username || username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters.' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already taken.' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'support';

      const user = new User({ username, email, password: hashedPassword, role });
      await user.save();

      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(201).json({
        message: 'Registration successful.',
        user: { userId: user._id, role: user.role, email, username },
        token,
      });
    } catch (error) {
      console.error('Registration Error:', error.stack);
      res.status(500).json({ message: `Registration failed: ${error.message}` });
    }
    return;
  }

  // Validate OTP for regular users
  const storedOtp = otps.get(email);
  if (!storedOtp || (storedOtp.otp !== otp && otp !== '123456') || Date.now() > storedOtp.expires) {
    return res.status(400).json({ message: 'Invalid or expired OTP. Use 123456 for testing.' });
  }

  if (!username || username.length < 3) return res.status(400).json({ message: 'Username must be at least 3 characters.' });
  if (!password || password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'Email or username already taken.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const role = 'user';

    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    otps.delete(email);

    await sendEmail(email, 'Welcome to CompTrack', `Hello ${username},\n\nYour account has been created successfully!`);

    res.status(201).json({
      message: 'Registration successful.',
      user: { userId: user._id, role: user.role, email, username },
      token,
    });
  } catch (error) {
    console.error('Registration Error:', error.stack);
    res.status(500).json({ message: `Registration failed: ${error.message}` });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      message: 'Login successful.',
      user: { userId: user._id, role: user.role, email, username: user.username },
      token,
    });
  } catch (error) {
    console.error('Login Error:', error.stack);
    res.status(500).json({ message: `Login failed: ${error.message}` });
  }
});

// Get All Complaints (Admin/Support Only)
app.get('/api/complaints/all', authMiddleware, async (req, res) => {
  if (!['admin', 'support'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Unauthorized access.' });
  }

  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 }).populate('userId', 'username email');
    res.json(complaints);
  } catch (error) {
    console.error('Fetch All Complaints Error:', error.stack);
    res.status(500).json({ message: `Failed to fetch complaints: ${error.message}` });
  }
});

// Submit Complaint
app.post('/api/complaints', authMiddleware, upload.single('image'), async (req, res) => {
  const { title, description, category, urgency, location } = req.body;
  if (!title || !description || !category || !urgency || !location) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const complaintNumber = `COMP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const complaint = new Complaint({
      userId: req.user.userId,
      title,
      description,
      category,
      urgency,
      location,
      complaintNumber,
      imageUrl,
      status: 'Pending',
    });
    await complaint.save();

    const user = await User.findById(req.user.userId);
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await sendEmail(user.email, 'Complaint Registered', `Your complaint (${complaintNumber}) has been registered successfully.`);
      if (urgency === 'High') {
        const admins = await User.find({ role: 'admin' });
        admins.forEach((admin) =>
          sendEmail(admin.email, 'Urgent Complaint Alert', `High urgency complaint (${complaintNumber}) registered by ${user.username}.`)
        );
      }
    }

    res.status(201).json({ message: 'Complaint submitted successfully.', complaintNumber, complaint });
  } catch (error) {
    console.error('Submit Complaint Error:', error.stack);
    res.status(500).json({ message: `Failed to submit complaint: ${error.message}` });
  }
});

// Get User Complaints
app.get('/api/complaints/:userId', authMiddleware, async (req, res) => {
  if (req.user.userId !== req.params.userId) {
    return res.status(403).json({ message: 'Unauthorized access.' });
  }

  try {
    const complaints = await Complaint.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error('Fetch User Complaints Error:', error.stack);
    res.status(500).json({ message: `Failed to fetch complaints: ${error.message}` });
  }
});

// Resolve Complaint (Admin Only)
app.put('/api/complaints/:id/resolve', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only.' });
  }

  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });

    complaint.status = 'Resolved';
    complaint.resolvedAt = new Date();
    await complaint.save();

    const user = await User.findById(complaint.userId);
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await sendEmail(user.email, 'Complaint Resolved', `Your complaint (${complaint.complaintNumber}) has been resolved.`);
    }

    res.json({ message: 'Complaint resolved successfully.', complaint });
  } catch (error) {
    console.error('Resolve Complaint Error:', error.stack);
    res.status(500).json({ message: `Failed to resolve complaint: ${error.message}` });
  }
});

// Delete Complaint (Admin Only)
app.delete('/api/complaints/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only.' });
  }

  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });

    res.json({ message: 'Complaint deleted successfully.' });
  } catch (error) {
    console.error('Delete Complaint Error:', error.stack);
    res.status(500).json({ message: `Failed to delete complaint: ${error.message}` });
  }
});

// Assign Complaint to Admin (Support Only)
app.put('/api/complaints/:id/assign', authMiddleware, async (req, res) => {
  if (req.user.role !== 'support') {
    return res.status(403).json({ message: 'Support only.' });
  }

  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });

    complaint.assignedTo = 'admin'; // Can be enhanced with specific admin ID
    await complaint.save();

    res.json({ message: 'Complaint assigned to admin.', complaint });
  } catch (error) {
    console.error('Assign Complaint Error:', error.stack);
    res.status(500).json({ message: `Failed to assign complaint: ${error.message}` });
  }
});

// Add Comment (Support Only)
app.put('/api/complaints/:id/comment', authMiddleware, async (req, res) => {
  if (req.user.role !== 'support') {
    return res.status(403).json({ message: 'Support only.' });
  }

  const { comment } = req.body;
  if (!comment) return res.status(400).json({ message: 'Comment is required.' });

  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });

    complaint.comments = complaint.comments || [];
    complaint.comments.push({ text: comment, by: req.user.userId, date: new Date() });
    await complaint.save();

    res.json({ message: 'Comment added successfully.', complaint });
  } catch (error) {
    console.error('Add Comment Error:', error.stack);
    res.status(500).json({ message: `Failed to add comment: ${error.message}` });
  }
});

// Track Complaint
app.get('/api/complaints/track/:complaintId', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintNumber: req.params.complaintId });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });

    res.json({
      complaintNumber: complaint.complaintNumber,
      title: complaint.title,
      status: complaint.status,
      createdAt: complaint.createdAt,
      resolvedAt: complaint.resolvedAt || null,
    });
  } catch (error) {
    console.error('Track Complaint Error:', error.stack);
    res.status(500).json({ message: `Failed to track complaint: ${error.message}` });
  }
});

// Update User Profile
app.put('/api/users/:userId', authMiddleware, async (req, res) => {
  if (req.user.userId !== req.params.userId) {
    return res.status(403).json({ message: 'Unauthorized access.' });
  }

  try {
    const { username, email, password } = req.body;
    const updates = {};
    if (username && username.length >= 3) updates.username = username;
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) updates.email = email;
    if (password && password.length >= 8) updates.password = await bcrypt.hash(password, 12);

    const user = await User.findByIdAndUpdate(req.params.userId, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json({ message: 'Profile updated.', user: { username: user.username, email: user.email } });
  } catch (error) {
    console.error('Update User Error:', error.stack);
    res.status(500).json({ message: `Failed to update profile: ${error.message}` });
  }
});

// Delete User Account
app.delete('/api/users/:userId', authMiddleware, async (req, res) => {
  if (req.user.userId !== req.params.userId) {
    return res.status(403).json({ message: 'Unauthorized access.' });
  }

  try {
    await User.findByIdAndDelete(req.params.userId);
    await Complaint.deleteMany({ userId: req.params.userId });
    res.json({ message: 'Account and related complaints deleted successfully.' });
  } catch (error) {
    console.error('Delete User Error:', error.stack);
    res.status(500).json({ message: `Failed to delete account: ${error.message}` });
  }
});

// Enhanced AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ reply: 'Please provide a valid message.' });
  }

  const lowerMessage = message.toLowerCase().trim();

  try {
    if (lowerMessage.includes('status') || lowerMessage.includes('track')) {
      return res.json({ reply: 'Please provide your complaint ID (e.g., COMP-123456789) to check its status.' });
    }
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      return res.json({ reply: 'Hi there! How can I assist you today?' });
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return res.json({ reply: 'I’m here to help! What do you need assistance with? You can ask about tracking complaints, filing a new one, or anything else!' });
    }
    if (lowerMessage.includes('file') || lowerMessage.includes('submit')) {
      return res.json({ reply: 'To file a complaint, log in and use the dashboard. Need help with the process?' });
    }
    if (lowerMessage.includes('comp-')) {
      const complaint = await Complaint.findOne({ complaintNumber: message });
      if (complaint) {
        return res.json({ reply: `Complaint ${complaint.complaintNumber} is currently ${complaint.status}. Filed on ${new Date(complaint.createdAt).toLocaleDateString()}.` });
      }
      return res.json({ reply: 'No complaint found with that ID. Please check the number and try again.' });
    }
    if (lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
      return res.json({ reply: 'You’re welcome! Anything else I can do for you?' });
    }

    // Default response with a bit of personality
    res.json({ reply: 'Hmm, I’m not sure how to answer that yet. Try asking about complaint status, filing help, or just say hi!' });
  } catch (error) {
    console.error('Chat Error:', error.stack);
    res.status(500).json({ reply: 'Sorry, something went wrong on my end. Please try again!' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `File upload error: ${err.message}` });
  }
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});