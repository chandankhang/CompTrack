import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'; // Import the middleware

const router = express.Router();

// Protected route: Get all complaints
router.get('/', authMiddleware, async (req, res) => {
  try {
    let complaints;
    if (req.user.role === 'admin') {
      complaints = await Complaint.find(); // Admin can see all complaints
    } else {
      complaints = await Complaint.find({ userId: req.user.id }); // Users see their own complaints
    }
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch complaints.' });
  }
});

// Protected route: Create a complaint
router.post('/', authMiddleware, async (req, res) => {
  try {
    const complaint = new complaint({ ...req.body, userId: req.user.id });
    await complaint.save();
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create complaint.' });
  }
});

// Protected route: Update a complaint
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const complaint = await complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update complaint.' });
  }
});

// Protected route: Delete a complaint
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByIdAndDelete(id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    res.json({ message: 'Complaint deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete complaint.' });
  }
});

export default router;