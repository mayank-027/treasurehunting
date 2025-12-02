import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

import env from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import router from './routes/index.js';

/**
 * Create Express Application
 * 
 * This function creates and configures the Express app.
 * 
 * @returns {Express} Configured Express application
 */
export const createServer = () => {
  const app = express();

  app.get("/", (req, res) => {
    res.send("Treasure Hunt Backend Live ⚡");
  });
  
  // Security headers - configure helmet for production
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false, // Disable CSP in dev for easier debugging
      crossOriginEmbedderPolicy: false, // Allow embedding if needed
    }),
  );
  
  // CORS configuration - allow multiple origins
  const allowedOrigins = [
    env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000',
    // Vercel preview URLs (wildcard pattern for all Vercel deployments)
    /^https:\/\/.*\.vercel\.app$/,
    // Support Vercel preview deployments (if CLIENT_URL contains vercel.app)
    env.CLIENT_URL && env.CLIENT_URL.includes('vercel.app') 
      ? new RegExp(`^https://.*${env.CLIENT_URL.replace(/^https?:\/\//, '').split('.')[0]}.*\\.vercel\\.app$`)
      : null,
  ].filter(Boolean); // Remove null/undefined values

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
          return callback(null, true);
        }
        
        // Check if origin is in allowed list
        const isAllowed = validOrigins.some((allowedOrigin) => {
          if (typeof allowedOrigin === 'string') {
            // Exact match for string origins
            return origin === allowedOrigin;
          }
          if (allowedOrigin instanceof RegExp) {
            return allowedOrigin.test(origin);
          }
          return false;
        });

        if (isAllowed) {
          callback(null, true);
        } else {
          // In development, allow all origins
          if (env.NODE_ENV === 'development') {
            callback(null, true);
          } else {
            // Log the rejected origin for debugging
            console.warn(`CORS: Origin not allowed: ${origin}`);
            callback(new Error('Not allowed by CORS'));
          }
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
      ],
      exposedHeaders: ['Authorization'],
      maxAge: 86400, // 24 hours - cache preflight requests
      preflightContinue: false,
      optionsSuccessStatus: 204,
    }),
  );
  
  // Body parser with size limit
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  
  // Logging - only in development
  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    // Minimal logging in production
    app.use(morgan('combined', {
      skip: (req) => req.path === '/health', // Skip health check logs
    }));
  }

  // Health check endpoint
  app.get('/health', (_req, res) => {
    try {
      // Quick database connection check
      const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: dbStatus,
        environment: env.NODE_ENV,
      });
    } catch (error) {
      res.status(503).json({ 
        status: 'error',
        message: 'Service unavailable',
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.use('/api', router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createServer;

