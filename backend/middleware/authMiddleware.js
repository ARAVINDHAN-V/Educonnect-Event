const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = req.headers.authorization;
  console.log("🔍 Incoming Token:", req.headers.authorization);
  if (!token) {
    console.log("🔍 Incoming Token:", req.headers.authorization);
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1]; // Extract actual token
  }

  try {
    console.log("🔍 Extracted Token:", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded User ID:", decoded.user.id);

    req.user = await User.findById(decoded.user.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    console.error('❌ Auth Middleware Error:', error);
    res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

module.exports = { protect }; 
