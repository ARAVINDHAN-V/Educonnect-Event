const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const Event = require('../models/Event');
const Registration = require('../models/Registration'); 
const upload = require('../middleware/uploadMiddleware');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/paymentProofs/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.floor(Math.random() * 1000)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

router.post('/events/:eventId/registrations', protect, upload.single('paymentProof'), async (req, res) => {
  try {
    const eventId = req.params.eventId;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: 'Cannot register for a past event' });
    }

    const {
      teamName,
      teamMemberCount, // keep raw string
      paperTitle,
      abstract,
      isLastMinutePass,
      totalFees
    } = req.body;

    if (!teamName || !teamMemberCount || !paperTitle || !abstract) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const parsedTeamMemberCount = parseInt(teamMemberCount, 10);

    // Check duplicate team name for this event
    const existing = await Registration.findOne({ eventId, teamName });
    if (existing) {
      return res.status(400).json({ message: 'This team is already registered' });
    }

    // Handle team members parsing
    let teamMembers = [];
    try {
      let rawMembers = req.body.members;
      if (Array.isArray(rawMembers)) {
        rawMembers = rawMembers[0]; // Handle FormData arrays
      }

      console.log('📦 Raw members:', rawMembers);
      teamMembers = JSON.parse(rawMembers);
      console.log('✅ Parsed team members:', teamMembers);
    } catch (err) {
      console.error('❌ JSON parse error:', err.message);
      return res.status(400).json({ message: 'Invalid team members data' });
    }

    // Validation
    if (teamMembers.length < 2) {
      return res.status(400).json({ message: 'Minimum 2 team members required' });
    }
    if (parsedTeamMemberCount !== teamMembers.length) {
      return res.status(400).json({ message: 'Team member count mismatch' });
    }

    // Count existing registrations
    const currentCount = await Registration.countDocuments({ eventId });
    const maxLimit = event.maxRegistrations || 50;

    if (currentCount >= maxLimit && isLastMinutePass !== 'true') {
      return res.status(400).json({ message: 'Max registrations reached. Use Last Minute Pass to continue.' });
    }

    // Handle payment proof path
    const paymentProofPath = req.file ? req.file.path.replace(/\\/g, "/") : '';

    // Final fees calculation
    const finalFees = totalFees || (isLastMinutePass === 'true'
      ? Math.round(event.price * 1.75)
      : event.price);

      const registration = new Registration({
        event: eventId,
        userId: req.user._id,
        teamName: req.body.teamName?.trim(),
        teamMembers,
        teamMemberCount: teamMembers.length, // ✅ important!
        paperTitle: req.body.paperTitle?.trim(),
        abstract: req.body.abstract?.trim(),
        paymentProof: req.file ? `/uploads/${req.file.filename}` : null, // ✅ must not be empty
        totalFees: req.body.totalFees || 0 // ✅ this must be provided from frontend
      });
      

    const saved = await registration.save();

    console.log('✅ Registration Saved:', saved);

    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});
router.get('/users/registrations', protect, async (req, res) => {
  try {
    const registrations = await Registration.find({ userId: req.user.id })
      .sort({ registrationDate: -1 });
    const registrationsWithEventDetails = await Promise.all(
      registrations.map(async (registration) => {
        const event = await Event.findById(registration.eventId)
          .select('title date time location imageUrl');
        
        return {
          ...registration._doc,
          event: event ? {
            _id: event._id,
            title: event.title,
            date: event.date,
            time: event.time,
            location: event.location,
            imageUrl: event.imageUrl
          } : null
        };
      })
    );
    
    res.json(registrationsWithEventDetails);
  } catch (err) {
    console.error('Error fetching user registrations:', err.message);
    res.status(500).json({ message: 'Server error fetching user registrations' });
  }
});

router.get('/users/registrations/:eventId', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    
    const registration = await Registration.findOne({
      userId: req.user.id,
      eventId: req.params.eventId
    });
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    res.json(registration);
  } catch (err) {
    console.error('Error fetching user registration:', err.message);
    res.status(500).json({ message: 'Server error fetching registration' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Public
// Get single event by ID
router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    console.error('❌ Error fetching event by ID:', err.message);
    res.status(500).json({ message: 'Server error while fetching event' });
  }
});



router.put('/users/registrations/:eventId', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    
    let registration = await Registration.findOne({
      userId: req.user.id,
      eventId: req.params.eventId
    });
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    // Check if event has already occurred
    const event = await Event.findById(req.params.eventId);
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: 'Cannot update registration for a past event' });
    }
    
    const { ticketType, specialRequirements, dietary } = req.body;
    
    // Update fields if provided
    if (ticketType) registration.ticketType = ticketType;
    if (specialRequirements !== undefined) registration.specialRequirements = specialRequirements;
    if (dietary !== undefined) registration.dietary = dietary;
    
    registration = await registration.save();
    res.json(registration);
  } catch (err) {
    console.error('Error updating registration:', err.message);
    res.status(500).json({ message: 'Server error updating registration' });
  }
});

// @route   DELETE /api/users/me/registrations/:eventId
// @desc    Cancel a user's registration
// @access  Private
router.delete('/users/registrations/:eventId', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    
    const registration = await Registration.findOne({
      userId: req.user.id,
      eventId: req.params.eventId
    });
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    // Check if event has already occurred
    const event = await Event.findById(req.params.eventId);
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: 'Cannot cancel registration for a past event' });
    }
    
    // Mark as cancelled instead of deleting
    registration.paymentStatus = 'Cancelled';
    await registration.save();
    
    res.json({ message: 'Registration cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling registration:', err.message);
    res.status(500).json({ message: 'Server error cancelling registration' });
  }
});

// @route   DELETE /api/events/:eventId/registrations/:registrationId
// @desc    Delete a specific registration (admin only)
// @access  Private (only for event creators or admins)
router.delete('/events/:eventId/registrations/:registrationId', protect, async (req, res) => {
  try {
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(req.params.eventId) || 
        !mongoose.Types.ObjectId.isValid(req.params.registrationId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Find the event
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check user permissions
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete registrations' });
    }
    
    // Find and delete the registration
    const registration = await Registration.findOneAndDelete({
      _id: req.params.registrationId,
      eventId: req.params.eventId
    });
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    res.json({ message: 'Registration deleted successfully' });
  } catch (err) {
    console.error('Error deleting registration:', err.message);
    res.status(500).json({ message: 'Server error deleting registration' });
  }
});

module.exports = router;