// models/Registration.js
const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  college: { type: String, required: true },
  studies: { type: String, required: true }, // UG/PG
  department: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true }
});

const RegistrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamName: { type: String, required: true },
  teamMemberCount: { type: Number, required: true, min: 2, max: 4 },
  teamMembers: { type: [TeamMemberSchema], required: true },
  paperTitle: { type: String, required: true },
  abstract: { type: String, required: true },
  paymentProof: { type: String, required: true }, // image URL or filename
  lastMinutePass: { type: Boolean, default: false },
  totalFees: { type: Number, required: true },
  paymentStatus: { type: String, default: 'Confirmed' },
  registrationDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registration', RegistrationSchema);
