const mongoose = require('mongoose');


// ✅ Define User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  role: { type: String, default: 'coordinator' }, // Default role
  createdAt: { type: Date, default: Date.now },
  profilePicture: { type: String, default: '' },
  bio: { type: String, default: 'Hello! I am a new user.' },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;