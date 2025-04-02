// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, minlength: 3 }, // name ki jagah username
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, default: 'user', enum: ['user', 'admin', 'support'] },
}, { timestamps: true });

export default mongoose.model('User', userSchema);