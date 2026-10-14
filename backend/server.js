const fs = require('fs');
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

// Configure CORS for separate frontend deployment & local development
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const configuredFrontend = process.env.FRONTEND_URL;
    if (configuredFrontend && (configuredFrontend === origin || configuredFrontend === '*')) {
      return callback(null, true);
    }

    // Allow any Vercel domain or localhost/127.0.0.1
    if (
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      !configuredFrontend
    ) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Check if frontend directory exists for local development
const frontendDir = path.join(__dirname, '../frontend');
const isLocalWithFrontend = !process.env.VERCEL && fs.existsSync(frontendDir);

// Serve static frontend files ONLY in local development when the folder actually exists on disk
if (isLocalWithFrontend) {
  app.use(express.static(frontendDir));
}

// Health check endpoint (actively verifies and reports API health and database connection state)
app.get('/api/health', async (req, res) => {
  let dbDiagnosticError = null;

  try {
    await connectDB();
  } catch (err) {
    // Strip any credentials from error message before returning in diagnostic response
    dbDiagnosticError = (err.message || '').replace(/:\/\/([^:]+):([^@]+)@/g, '://$1:****@');
  }

  const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const currentState = mongoose.connection.readyState;
  const isDbConnected = currentState === 1;

  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'ok' : 'degraded',
    message: isDbConnected
      ? 'Clothing Exchange & Swap Marketplace API is healthy and running'
      : 'API is running but database is not connected',
    database: dbStates[currentState] || 'unknown',
    ...(dbDiagnosticError ? { error: dbDiagnosticError } : {}),
    timestamp: new Date().toISOString()
  });
});

// Root endpoint - returns API info & endpoint index (or serves local index.html if present)
app.get('/', (req, res) => {
  if (isLocalWithFrontend && fs.existsSync(path.join(frontendDir, 'index.html'))) {
    return res.sendFile(path.join(frontendDir, 'index.html'));
  }
  res.json({
    name: 'Clothing Exchange & Swap Marketplace API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      clothing: '/api/clothing',
      swaps: '/api/swaps',
      chat: '/api/chat',
      admin: '/api/admin'
    }
  });
});

// Database connection middleware for all /api endpoints in serverless & local runtime
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error(`[API] DB connection error for ${req.method} ${req.originalUrl}:`, error.message);
    const sanitizedError = (error.message || '').replace(/:\/\/([^:]+):([^@]+)@/g, '://$1:****@');
    res.status(503).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGODB_URI is configured properly in environment variables.',
      error: sanitizedError
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

// Fallback route for undefined paths
app.use((req, res) => {
  // If running locally with frontend present, allow client-side page routing
  if (isLocalWithFrontend && req.method === 'GET' && !req.path.startsWith('/api') && fs.existsSync(path.join(frontendDir, 'index.html'))) {
    return res.sendFile(path.join(frontendDir, 'index.html'));
  }

  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
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

// Warm up connection attempt on cold start in both serverless and local environments
connectDB().then(() => {
  seedIfNeeded();
}).catch((err) => {
  console.warn('[MongoDB Diagnostic] Cold-start connection notice:', err.message);
});

// Start local server only when executed directly (node backend/server.js or npm start)
// On Vercel, the file is required as a module, so app.listen is omitted
if (require.main === module && !process.env.VERCEL) {
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

