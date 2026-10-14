const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  // If already connected, reuse existing connection
  if (mongoose.connection.readyState >= 1) {
    isConnected = true;
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clothing_swap_marketplace';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    console.log(` MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(` MongoDB Connection Error: ${error.message}`);
    // Only exit process when run directly as a standalone CLI script
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;

