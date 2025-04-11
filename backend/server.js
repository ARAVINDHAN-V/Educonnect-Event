const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ======= Import Routes =======
const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');  
const registrationsRoutes = require('./routes/registrations');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users'); 
const profileRoutes = require('./routes/profile');


// ======= Static Upload Folder Setup =======
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======= Middleware =======
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======= API Routes =======
app.use('/api/users/register', registerRoutes);  // Register user route
app.use('/api/users/login', loginRoutes);        // Login route
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/users', userRoutes);  // ✅ Fixed: Mounted the users route properly
app.use('/api/profile', profileRoutes);


console.log("✅ Events route mounted at /api/events");
console.log("✅ Users route mounted at /api/users");

// ======= MongoDB Connection =======
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ======= Health Check Route =======
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// ======= Global Error Handler =======
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// ======= Start the Server =======
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ======= Graceful Shutdown =======
process.on('SIGINT', async () => {
  console.log('⚠️ SIGINT received: Closing server...');

  server.close(() => {
    console.log('✅ HTTP server closed');

    mongoose.connection.close().then(() => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    }).catch(err => {
      console.error('❌ Error closing MongoDB connection:', err);
      process.exit(1);
    });

  });
});

module.exports = app;
