import { createServer } from '../src/server.js';
import { connectToDatabase } from '../src/config/db.js';
import { validateEnv } from '../src/config/env.js';

// Initialize app once (cached across invocations)
let app = null;

// Cache database connection for serverless
let dbConnected = false;

// Initialize app and database connection
async function initialize() {
  if (app) return app;

  // Validate environment variables first
  try {
    validateEnv();
  } catch (error) {
    console.error('Environment validation error:', error);
    throw new Error(`Server configuration error: ${error.message}`);
  }

  // Create Express app
  app = createServer();

  // Connect to database (connection is cached in db.js)
  try {
    await connectToDatabase();
    dbConnected = true;
  } catch (error) {
    console.error('Database connection error:', error);
    dbConnected = false;
    throw error;
  }

  return app;
}

// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    // Initialize app and database connection
    const expressApp = await initialize();
    
    // Handle the request with Express app
    return expressApp(req, res);
  } catch (error) {
    // Handle initialization errors
    console.error('Handler error:', error);
    
    if (!res.headersSent) {
      if (error.message.includes('Database')) {
        return res.status(503).json({
          error: 'Database connection failed',
          message: error.message,
        });
      }
      
      return res.status(500).json({
        error: 'Server initialization error',
        message: error.message,
      });
    }
  }
}

