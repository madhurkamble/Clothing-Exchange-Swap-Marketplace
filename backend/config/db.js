const mongoose = require('mongoose');

let cachedPromise = null;

// Helper to safely extract host information without logging credentials or query parameters
const getSafeHostInfo = (uriString) => {
  if (!uriString) return 'none (empty)';
  try {
    const isSrv = uriString.startsWith('mongodb+srv://');
    const isStandard = uriString.startsWith('mongodb://');
    const protocol = isSrv ? 'mongodb+srv' : isStandard ? 'mongodb' : 'unknown';
    
    // Extract host portion between '@' and '/' or '?'
    const atIndex = uriString.indexOf('@');
    if (atIndex !== -1) {
      const rest = uriString.substring(atIndex + 1);
      const host = rest.split('/')[0].split('?')[0];
      return `${protocol}://${host}`;
    }
    // Local / direct connection without credentials
    const clean = uriString.replace(/mongodb(\+srv)?:\/\//, '').split('/')[0].split('?')[0];
    return `${protocol}://${clean}`;
  } catch (_) {
    return 'unparseable';
  }
};

const connectDB = async () => {
  // 1. If already fully connected, return active connection immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // 2. If a connection is already in progress, await the existing promise
  if (cachedPromise && mongoose.connection.readyState === 2) {
    return cachedPromise;
  }

  const hasEnvUri = !!process.env.MONGODB_URI;
  const rawUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clothing_swap_marketplace';
  // Strip any accidental leading/trailing whitespace or quotes from copy-paste
  const uri = rawUri.trim().replace(/^["']|["']$/g, '');

  const safeTarget = getSafeHostInfo(uri);

  if (!hasEnvUri) {
    console.warn('[MongoDB Diagnostic] process.env.MONGODB_URI is not set. Falling back to local default.');
  }

  console.log(`[MongoDB Diagnostic] Initiating connection to: ${safeTarget} (readyState: ${mongoose.connection.readyState})`);

  cachedPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  }).then((conn) => {
    console.log(`[MongoDB Diagnostic] Connection established successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  }).catch((error) => {
    cachedPromise = null;
    console.error(`[MongoDB Diagnostic] Connection failed (${error.name}): ${error.message}`);
    // Only exit process when run directly as a standalone CLI script
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  });

  return cachedPromise;
};

module.exports = connectDB;


