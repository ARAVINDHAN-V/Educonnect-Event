import Event from '../models/Event.js';

export const createEvent = async (req, res) => {
  try {
    console.log("🔹 Incoming Event Creation Request");
    console.log("User from req.user:", req.user);
    console.log("File uploaded:", req.file);
    console.log("Request Body:", req.body);

    const {
      title,
      description,
      date,
      time,
      location,
      price,
      registrationLimit,
      lastMinutePassAllowed,
      lastMinuteFeeMultiplier
    } = req.body;

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const newEvent = new Event({
      title,
      description,
      date,
      time,
      location,
      price: parseFloat(price) || 0,
      imageUrl,
      createdBy: req.user._id,
      registrationLimit: parseInt(registrationLimit) || 50,
      lastMinutePassAllowed: lastMinutePassAllowed === 'true',
      lastMinuteFeeMultiplier: parseFloat(lastMinuteFeeMultiplier) || 1.75,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("❌ Error creating event:", error.message);
    res.status(500).json({ message: "Server error while creating event" });
  }
};
