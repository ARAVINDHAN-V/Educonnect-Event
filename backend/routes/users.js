const express = require('express');
const router = express.Router();

// Test route for users
router.get('/', (req, res) => {
  res.json({ message: 'Users route working' });
});

module.exports = router;
