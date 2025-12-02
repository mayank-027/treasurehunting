import mongoose from 'mongoose';

import env from './env.js';

// Cache the connection to reuse
let cachedConnection = null;

export const connectToDatabase = async () => {
  // Return cached connection if available and connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  // If connection exists but is not ready, close it first
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

  // Optimize connection options for serverless
  const options = {
    autoIndex: env.NODE_ENV === 'development', // Only auto-index in development
    maxPoolSize: 1, // Single connection for serverless (reduces connection overhead)
    minPoolSize: 0, // Allow connection pool to close completely
    serverSelectionTimeoutMS: 3000, // Faster timeout for serverless
    socketTimeoutMS: 10000, // Shorter timeout for serverless
    connectTimeoutMS: 3000, // Fast connection timeout
  };

  try {
    cachedConnection = await mongoose.connect(env.MONGO_URI, options);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      cachedConnection = null;
    });

    if (env.NODE_ENV === 'development') {
      console.log('Connected to MongoDB');
    }
    
    return cachedConnection;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    cachedConnection = null;
    throw error;
  }
};

