/**
 * Vercel Serverless Function Handler
 * 
 * This is the entry point for all API requests on Vercel.
 * It wraps the Express app using serverless-http to handle serverless invocations.
 * 
 * Database connection is cached globally to prevent reconnection on every request.
 */

import serverless from 'serverless-http';
// Import server from the server directory
import { createServer } from '../server/src/server.js';
import { connectToDatabase } from '../server/src/config/db.js';
import { validateEnv } from '../server/src/config/env.js';

// Cache the Express app and serverless handler across invocations
let app = null;
let handler = null;
let dbConnectionPromise = null;

/**
 * Initialize the serverless handler
 * This function is called once per cold start, then cached
 */
const initServerlessHandler = async () => {
  // Create Express app if not cached
  if (!app) {
    app = createServer();
  }

  // Ensure environment variables are present and valid for runtime
  validateEnv();

  // Ensure database connection (cached globally)
  if (!dbConnectionPromise) {
    dbConnectionPromise = connectToDatabase().catch((error) => {
      console.error('Database connection error:', error);
      dbConnectionPromise = null; // Reset on error to allow retry
      throw error;
    });
  }

  // Wait for database connection
  await dbConnectionPromise;

  // Create serverless handler if not cached
  if (!handler) {
    handler = serverless(app, {
      binary: ['image/*', 'application/pdf'], // Handle binary responses
    });
  }

  return handler;
};

/**
 * Vercel serverless function handler
 * This is called for each API request
 */
export default async function vercelHandler(req, res) {
  // Set timeout for serverless functions
  // Vercel free tier: 10s, Pro: 60s
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ 
        error: 'Gateway timeout',
        message: 'Request took too long to process'
      });
    }
  }, 25000); // 25 seconds (safe for Pro tier)

  try {
    // Initialize handler (cached after first call)
    const serverlessHandler = await initServerlessHandler();
    
    // Clear timeout on successful response
    const originalEnd = res.end.bind(res);
    res.end = function(...args) {
      clearTimeout(timeout);
      return originalEnd(...args);
    };

    // Handle the request using serverless-http
    return serverlessHandler(req, res);
  } catch (error) {
    clearTimeout(timeout);
    
    console.error('Serverless handler error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      path: req.url,
      method: req.method,
    });

    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'An error occurred while processing your request'
      });
    }
  }
}

export const config = {
  maxDuration: 30,
};

