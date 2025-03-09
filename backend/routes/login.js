const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Generate token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          // Use minimal logging in production
          console.error('Token generation error');
          return res.status(500).json({ message: 'Error generating authentication token' });
        }
        
        // Return user info without sensitive data
        res.json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            department: user.department,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    // Generic error response for security
    console.error('Login error');
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;