const jwt = require('jsonwebtoken'); // Make sure to import jwt

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  console.log('Received Authorization Header:', authHeader);

  if (!authHeader) {
    console.log('No authorization header');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Ensure the token is extracted correctly
    const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : authHeader;
    
    console.log('Extracted Token:', token);

    // Verify token using the secret from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded User:', decoded);

    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token Verification Error:', err);
    
    // More specific error handling
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;