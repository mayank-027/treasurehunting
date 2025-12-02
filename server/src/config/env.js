import { config } from 'dotenv';

// Load .env in local development
config();

// Determine if we're in production/Vercel
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

const env = {
  NODE_ENV: process.env.NODE_ENV ?? (isProduction ? 'production' : 'development'),
  PORT: Number(process.env.PORT ?? 5000),
  CLIENT_URL: process.env.CLIENT_URL ?? 
    (process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.VERCEL 
        ? `https://${process.env.VERCEL}` 
        : 'http://localhost:5173'),
  MONGO_URI: process.env.MONGO_URI,
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

