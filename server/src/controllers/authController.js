import { z } from 'zod';
import jwt from 'jsonwebtoken';

import { adminConfig } from '../config/admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  if (email !== adminConfig.email || password !== adminConfig.password) {
    throw httpError(401, 'Invalid credentials');
  }

  const token = jwt.sign(
    {
      role: 'admin',
      email,
    },
    adminConfig.jwtSecret,
    {
      expiresIn: '8h',
    },
  );

  res.json({ token });
});

