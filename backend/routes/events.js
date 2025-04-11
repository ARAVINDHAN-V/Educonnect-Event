const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { protect } = require('../middleware/authMiddleware');

// ========================
// Multer Storage Config
// ========================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ========================
// GET All Events
// ========================
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).lean();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching events' });
  }
});

// ========================
// GET Event Details
// ========================
router.get('/:id', async (req, res) => {
  const eventId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  try {
    const event = await Event.findById(eventId).lean();
    if (!event) return res.status(404).json({ message: 'Event not found' });

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching event details' });
  }
});

// ========================
// GET Event Registrations (Organizer Only)
// ========================
router.get('/:id/registrations', protect, async (req, res) => {
  const eventId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID format' });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view registrations' });
    }

    const registrations = await Registration.find({ event: eventId })
      .populate('user', 'name email')
      .lean();

    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching registrations' });
  }
});

// ========================
// GET Registration Count for Event
// ========================
router.get('/:id/registration-count', async (req, res) => {
  const eventId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  try {
    const count = await Registration.countDocuments({ event: eventId });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching registration count' });
  }
});

// ========================
// GET Logged-in User's Registrations
// ========================
router.get('/my-registrations', protect, async (req, res) => {
  try {
    const registrations = await Registration.find({ userId: req.user._id })
      .populate('event', 'title date location')
      .lean();

    res.json(registrations.map(r => r.event));
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching your registrations' });
  }
});

// ========================
// CREATE Event (Private)
// ========================
// ✅ Updated CREATE Event Route
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl?.startsWith('http')) {
      imageUrl = req.body.imageUrl.trim();
    }

    const newEvent = new Event({
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      time: req.body.time,
      location: req.body.location,
      fee: parseFloat(req.body.price) || 0, // ✅ match "fee" from schema
      maxRegistrations: parseInt(req.body.registrationLimit) || 50, // ✅ match schema
      imageUrl: imageUrl, // ✅ match schema
      createdBy: req.user._id,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error('❌ Error creating event:', err);
    res.status(500).json({ message: 'Server error creating event' });
  }
});


// ========================
// UPDATE Event (Private)
// ========================
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    event.title = req.body.title;
    event.description = req.body.description;
    event.date = req.body.date;
    event.location = req.body.location;
    event.price = parseFloat(req.body.price) || 0;
    event.registrationLimit = parseInt(req.body.registrationLimit) || 50;
    event.lastMinutePassAllowed = req.body.lastMinutePassAllowed === 'true';
    event.lastMinuteFeeMultiplier = parseFloat(req.body.lastMinuteFeeMultiplier) || 1.75;

    if (req.file) {
      event.imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      event.imageUrl = req.body.imageUrl;
    }

    await event.save();
    res.status(200).json({ message: 'Event updated successfully', event });
  } catch (err) {
    res.status(500).json({ message: 'Server error while updating event' });
  }
});

// ========================
// DELETE Event (Private)
// ========================
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this event' });
    }

    await Event.deleteOne({ _id: event._id });
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error while deleting event' });
  }
});

module.exports = router;
