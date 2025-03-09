// models/Registration.js
const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  ticketType: {
    type: String,
    enum: ['Standard', 'Premium', 'VIP', 'Early Bird'],
    default: 'Standard'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Cancelled', 'Refunded'],
    default: 'Pending'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  specialRequirements: {
    type: String,
    default: ''
  },
  dietary: {
    type: String,
    default: ''
  },
  checkInStatus: {
    type: String,
    enum: ['Not Checked In', 'Checked In'],
    default: 'Not Checked In'
  },
  checkInTime: {
    type: Date
  },
  ticketCode: {
    type: String
  }
});

// Index for faster queries
RegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

// Generate ticket code on save if not present
RegistrationSchema.pre('save', function(next) {
  if (!this.ticketCode) {
    // Generate a unique ticket code
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.ticketCode = `${randomString}-${this._id.toString().substr(-6)}`;
  }
  next();
});

// Virtual for calculating days since registration
RegistrationSchema.virtual('daysSinceRegistration').get(function() {
  return Math.floor((Date.now() - this.registrationDate) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Registration', RegistrationSchema);