const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const seedDemoUsers = require('./config/seed');
const authRoutes = require('./routes/authRoutes');
const clothingRoutes = require('./routes/clothingRoutes');
const swapRoutes = require('./routes/swapRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check endpoint (reports service and database state)
app.get('/api/health', (req, res) => {
  const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'ok',
    message: 'Clothing Exchange & Swap Marketplace API is healthy and running',
    database: dbStates[mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString()
  });
});

// Database connection middleware for all /api endpoints in serverless & local runtime
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error in request:', error.message);
    res.status(503).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGODB_URI is configured properly in environment variables.'
    });
  }
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Clothing Marketplace Routes
app.use('/api/clothing', clothingRoutes);

// Swap Exchange Routes
app.use('/api/swaps', swapRoutes);

// Negotiation Chat Routes
app.use('/api/chat', chatRoutes);

// Admin Management & Analytics Routes
app.use('/api/admin', adminRoutes);

// Fallback route for index.html / SPA navigation
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Demo Seeding helper
let isSeeded = false;
const seedIfNeeded = async () => {
  if (!isSeeded) {
    try {
      await seedDemoUsers();
      isSeeded = true;
    } catch (err) {
      console.error('Demo data seeding error:', err.message);
    }
  }
};

const PORT = process.env.PORT || 5000;
let server;

// Start local server only when executed directly (node backend/server.js or npm start)
// On Vercel, the file is required as a module, so app.listen is omitted
if (require.main === module && !process.env.VERCEL) {
  connectDB().then(() => {
    seedIfNeeded();
  }).catch((err) => {
    console.error('Initial DB connection error:', err.message);
  });

  server = app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(` Clothing Exchange Server running on port ${PORT}`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(` Web App:      http://localhost:${PORT}`);
    console.log(`=================================================`);
  });
}

// Export Express app as the default export for Vercel serverless runtime
module.exports = app;
// Maintain named exports for backward compatibility
module.exports.app = app;
module.exports.server = server;

