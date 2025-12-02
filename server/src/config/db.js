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

  // Optimize connection options
  const options = {
    autoIndex: env.NODE_ENV === 'development', // Only auto-index in development
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
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

