// routes/registrations.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');

// @route   POST /api/events/:eventId/registrations
// @desc    Register for an event
// @access  Private
router.post('/events/:eventId/registrations', auth, async (req, res) => {

  try {
    const eventId = req.params.eventId;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    const event = await Event.findById(eventId);
    
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event has already occurred
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: 'Cannot register for a past event' });
    }
    
    // Check if user is already registered
    const existingRegistration = await Registration.findOne({
      eventId: req.params.eventId,
      userId: req.user.id
    });
    
    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    
    const { 
      ticketType = 'Standard', 
      paymentStatus = 'Pending',
      specialRequirements = '',
      dietary = ''
    } = req.body;
    
    // Get user details
    const user = await User.findById(req.user.id).select('-password');
    
    const newRegistration = new Registration({
      eventId: req.params.eventId,
      userId: req.user.id,
      name: user.name,
      email: user.email,
      department: user.department || 'Not specified',
      ticketType,
      paymentStatus,
      specialRequirements,
      dietary
    });
    
    const registration = await newRegistration.save();
    
    // Return registration with event details
    const registrationWithEvent = {
      ...registration._doc,
      event: {
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location
      }
    };
    
    res.status(201).json(registrationWithEvent);
  } catch (err) {
    console.error('Error registering for event:', err.message);
    res.status(500).json({ message: 'Server error registering for event' });
  }
});

// @route   GET /api/events/:eventId/registrations
// @desc    Get all registrations for a specific event
// @access  Private (only for event creators or admins)
router.get('/events/:eventId/registrations', auth, async (req, res) => {
  try {
    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(req.params.eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    // First, verify the event exists and the user has permission to view its registrations
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if the user is the event creator or an admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view registrations' });
    }
    
    // Fetch registrations for this event
    const registrations = await Registration.find({ eventId: req.params.eventId })
      .sort({ registrationDate: -1 });
    
    res.json(registrations);
  } catch (err) {
    console.error('Error fetching event registrations:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error fetching registrations' });
  }
});

// @route   GET /api/users/me/registrations
// @desc    Get all registrations for the logged-in user
// @access  Private
router.get('/users/registrations', auth, async (req, res) => {
  try {
    const registrations = await Registration.find({ userId: req.user.id })
      .sort({ registrationDate: -1 });
      
    // Fetch event details for each registration
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

// @route   GET /api/users/me/registrations/:eventId
// @desc    Get a specific registration for the logged-in user
// @access  Private
router.get('/users/registrations/:eventId', auth, async (req, res) => {
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

// @route   PUT /api/users/me/registrations/:eventId
// @desc    Update a user's registration
// @access  Private
router.put('/users/registrations/:eventId', auth, async (req, res) => {
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
router.delete('/users/registrations/:eventId', auth, async (req, res) => {
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
router.delete('/events/:eventId/registrations/:registrationId', auth, async (req, res) => {
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