import { config } from 'dotenv';

// Load .env in local development
config();

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

const env = {
  NODE_ENV: process.env.NODE_ENV ?? (isProduction ? 'production' : 'development'),
  PORT: Number(process.env.PORT ?? 5000),
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  MONGO_URI: process.env.MONGO_URI,
  // Vercel provides VERCEL_URL in production
  VERCEL_URL: process.env.VERCEL_URL,
};

export function validateEnv() {
  const requiredKeys = ['MONGO_URI'];
  requiredKeys.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });
}

export default env;

