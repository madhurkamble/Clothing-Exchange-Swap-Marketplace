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

// Exact deployed frontend URL and local origins
const exactFrontendOrigin = 'https://clothing-exchange-swap-marketplace-frontend.vercel.app';
const configuredFrontend = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null;

const allowedOrigins = [
  exactFrontendOrigin,
  configuredFrontend,
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5000'
].filter(Boolean);

// Configure CORS for separate frontend deployment & local development
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, '');

    if (
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.includes('localhost') ||
      cleanOrigin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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

// Root endpoint - serves styled HTML status page for web browsers or JSON for API clients
app.get('/', (req, res) => {
  if (isLocalWithFrontend && fs.existsSync(path.join(frontendDir, 'index.html'))) {
    return res.sendFile(path.join(frontendDir, 'index.html'));
  }

  // Return JSON if requested by programmatic API client
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.json({
      name: 'Clothing Exchange & Swap Marketplace API',
      status: 'online',
      version: '1.0.0',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        clothing: '/api/clothing',
        swaps: '/api/swaps',
        chat: '/api/chat',
        admin: '/api/admin'
      }
    });
  }

  // Render a clean service dashboard in web browsers
  const isDbUp = mongoose.connection.readyState === 1;
  const webAppUrl = configuredFrontend || exactFrontendOrigin;

  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clothing Exchange API | Online</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 2rem; display: flex; justify-content: center; align-items: center; min-height: 100vh; box-sizing: border-box; }
    .card { background: white; max-width: 620px; width: 100%; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); padding: 2.25rem; border: 1px solid #e2e8f0; }
    .badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; background: #dcfce7; color: #15803d; }
    .badge.off { background: #fee2e2; color: #b91c1c; }
    .pulse { width: 8px; height: 8px; border-radius: 50%; background: #10b981; animation: pulse 1.6s infinite; }
    @keyframes pulse { 0% { transform: scale(0.95); opacity: 1; } 70% { transform: scale(1.4); opacity: 0; } 100% { opacity: 0; } }
    h1 { font-size: 1.6rem; margin: 1.25rem 0 0.5rem; }
    p { color: #64748b; line-height: 1.6; margin: 0 0 1.5rem; }
    .links-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem; }
    .btn { display: inline-flex; justify-content: center; align-items: center; padding: 0.75rem 1rem; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 0.92rem; }
    .btn-primary { background: #10b981; color: white; }
    .btn-primary:hover { background: #059669; }
    .btn-outline { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }
    .btn-outline:hover { background: #e2e8f0; }
    .endpoints { background: #f8fafc; border-radius: 8px; padding: 1rem; border: 1px solid #e2e8f0; font-family: monospace; font-size: 0.85rem; color: #334155; }
    .endpoint-item { display: flex; justify-content: space-between; padding: 0.35rem 0; border-bottom: 1px dashed #e2e8f0; }
    .endpoint-item:last-child { border-bottom: none; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge ${isDbUp ? '' : 'off'}">
      <span class="pulse" style="${isDbUp ? '' : 'background: #ef4444;'}"></span>
      ${isDbUp ? 'API Online & MongoDB Connected' : 'API Running (Database Offline)'}
    </span>
    <h1>Clothing Exchange & Swap API</h1>
    <p>The backend RESTful service is live and handling requests. Connect from the frontend application or browse the endpoints below.</p>
    <div class="links-grid">
      <a href="${webAppUrl}" class="btn btn-primary" target="_blank">Open Web App ➔</a>
      <a href="/api/health" class="btn btn-outline" target="_blank">Inspect /api/health</a>
    </div>
    <div class="endpoints">
      <div class="endpoint-item"><span>GET /api/health</span> <strong>Health Status</strong></div>
      <div class="endpoint-item"><span>POST /api/auth/login</span> <strong>User Login</strong></div>
      <div class="endpoint-item"><span>POST /api/auth/register</span> <strong>User Sign Up</strong></div>
      <div class="endpoint-item"><span>GET /api/clothing</span> <strong>Garment Marketplace</strong></div>
      <div class="endpoint-item"><span>GET /api/swaps/incoming</span> <strong>Barter Swaps</strong></div>
      <div class="endpoint-item"><span>POST /api/chat/messages</span> <strong>Negotiation Chat</strong></div>
    </div>
  </div>
</body>
</html>`);
});

// Database connection middleware for all /api endpoints in serverless & local runtime
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    if (!isSeeded && mongoose.connection.readyState === 1) {
      seedIfNeeded().catch(err => console.warn('[Seed Diagnostic]', err.message));
    }
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

