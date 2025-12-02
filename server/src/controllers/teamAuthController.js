import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { Round } from '../models/Round.js';
import { Team } from '../models/Team.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateStartCode } from '../utils/generateStartCode.js';
import { httpError } from '../utils/httpError.js';

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const teamSignup = asyncHandler(async (req, res) => {
  const payload = signupSchema.parse(req.body);

  const existingEmail = await Team.findOne({ email: payload.email.toLowerCase() });
  if (existingEmail) {
    throw httpError(409, 'Email already in use');
  }

  const startRound = 1;
  const roundExists = await Round.exists({ roundNumber: startRound });
  if (!roundExists) {
    throw httpError(400, 'Game not configured yet. No starting round found.');
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);

  let startCode = generateStartCode();
  // ensure unique start code
  while (true) {
    const existingCode = await Team.findOne({ startCode });
    if (!existingCode) break;
    startCode = generateStartCode();
  }

  const team = await Team.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    passwordHash,
    startCode,
    currentRoundNumber: startRound,
    progress: [{ roundNumber: startRound }],
  });

  res.status(201).json({
    team: {
      id: team._id,
      name: team.name,
      email: team.email,
      startCode: team.startCode,
      currentRoundNumber: team.currentRoundNumber,
      status: team.status,
    },
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const teamLogin = asyncHandler(async (req, res) => {
  const payload = loginSchema.parse(req.body);

  const team = await Team.findOne({ email: payload.email.toLowerCase() });
  if (!team) {
    throw httpError(401, 'Invalid credentials');
  }

  const ok = await bcrypt.compare(payload.password, team.passwordHash);
  if (!ok) {
    throw httpError(401, 'Invalid credentials');
  }

  res.json({
    team: {
      id: team._id,
      name: team.name,
      email: team.email,
      startCode: team.startCode,
      currentRoundNumber: team.currentRoundNumber,
      status: team.status,
    },
  });
});

