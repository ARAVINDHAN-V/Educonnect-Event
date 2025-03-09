const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');

const mongoose = require('mongoose');

// Safer event fetching route
router.get('/:id', async (req, res) => {
  try {
    // Validate the incoming ID first
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        message: 'Invalid event ID format',
        receivedId: req.params.id 
      });
    }

    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (err) {
    console.error('Detailed Event Fetch Error:', {
      message: err.message,
      stack: err.stack,
      receivedId: req.params.id
    });
    res.status(500).json({ 
      message: 'Server error fetching event',
      error: process.env.NODE_ENV !== 'production' ? err.message : {}
    });
  }
});


// @route   POST /api/events
// @desc    Create a new event
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      date, 
      time, 
      location, 
      price, 
      imageUrl 
    } = req.body;
    
    // Create new event
    const newEvent = new Event({
      title,
      description,
      date,
      time,
      location,
      price,
      imageUrl,
      createdBy: req.user.id
    });

    const event = await newEvent.save();
    res.status(201).json(event);
  } catch (err) {
    console.error('Error creating event:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check user is the creator or an admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    // Update fields
    const { 
      title, 
      description, 
      date, 
      time, 
      location, 
      price, 
      imageUrl 
    } = req.body;
    
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (time) event.time = time;
    if (location) event.location = location;
    if (price !== undefined) event.price = price;
    if (imageUrl) event.imageUrl = imageUrl;
    
    await event.save();
    res.json(event);
  } catch (err) {
    console.error('Error updating event:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check user is the creator or an admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
    
    await event.remove();
    res.json({ message: 'Event removed' });
  } catch (err) {
    console.error('Error deleting event:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/', async (req, res) => {
  try {
    console.log('Attempting to fetch all events');
    const events = await Event.find().sort({ date: 1 });
    
    console.log(`Fetched ${events.length} events`);
    
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ 
      message: 'Server error fetching events', 
      error: process.env.NODE_ENV !== 'production' ? err.message : {} 
    });
  }
})
module.exports = router;