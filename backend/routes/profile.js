const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');

// Route: GET & PUT User Profile
router.route('/')
    .get(protect, getUserProfile)   // Get user profile
    .put(protect, updateUserProfile); // Update user profile

module.exports = router;
