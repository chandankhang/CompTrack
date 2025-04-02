// models/complaint.js
import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  urgency: { type: String, required: true },
  location: { type: String, required: true },
  complaintNumber: { type: String, required: true, unique: true },
  imageUrl: { type: String },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Resolved'] },
  assignedTo: { type: String }, // For support assigning to admin
  comments: [{
    text: { type: String, required: true },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

export default mongoose.model('Complaint', complaintSchema);