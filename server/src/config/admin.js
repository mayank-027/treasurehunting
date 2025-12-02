import { config } from 'dotenv';

config();

const required = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'JWT_SECRET'];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required admin env variable: ${key}`);
  }
});

export const adminConfig = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  jwtSecret: process.env.JWT_SECRET,
};

