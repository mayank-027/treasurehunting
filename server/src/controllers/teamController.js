import { z } from 'zod';

import { Round } from '../models/Round.js';
import { Team } from '../models/Team.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateStartCode } from '../utils/generateStartCode.js';
import { httpError } from '../utils/httpError.js';

const createTeamSchema = z.object({
  name: z.string().min(2),
  startCode: z.string().min(3).optional(),
  startingRound: z.number().int().positive().default(1),
  autoGenerateStartCode: z.boolean().optional(),
});

export const createTeam = asyncHandler(async (req, res) => {
  const payload = createTeamSchema.parse(req.body);

  const roundExists = await Round.exists({ roundNumber: payload.startingRound });
  if (!roundExists) {
    throw httpError(400, `Round ${payload.startingRound} does not exist yet`);
  }

  let startCode = payload.startCode?.toUpperCase();
  if (payload.autoGenerateStartCode || !startCode) {
    startCode = generateStartCode();
  }

  const existing = await Team.findOne({ startCode });
  if (existing) {
    throw httpError(409, 'Start code already in use');
  }

  const team = await Team.create({
    name: payload.name,
    startCode,
    currentRoundNumber: payload.startingRound,
    progress: [{ roundNumber: payload.startingRound }],
  });

  res.status(201).json(team);
});

export const listTeams = asyncHandler(async (_req, res) => {
  const teams = await Team.find().sort({ createdAt: -1 });
  res.json(teams);
});

export const getTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) {
    throw httpError(404, 'Team not found');
  }
  res.json(team);
});

const updateTeamSchema = z.object({
  name: z.string().min(2).optional(),
  currentRoundNumber: z.number().int().positive().optional(),
  status: z.enum(['not_started', 'playing', 'locked', 'completed']).optional(),
});

export const updateTeam = asyncHandler(async (req, res) => {
  const payload = updateTeamSchema.parse(req.body);

  if (payload.currentRoundNumber) {
    const roundExists = await Round.exists({ roundNumber: payload.currentRoundNumber });
    if (!roundExists) {
      throw httpError(400, 'Target round does not exist');
    }
  }

  const team = await Team.findByIdAndUpdate(
    req.params.id,
    { $set: payload },
    { new: true, runValidators: true },
  );

  if (!team) {
    throw httpError(404, 'Team not found');
  }

  res.json(team);
});

const assignCodeSchema = z.object({
  startCode: z
    .string()
    .regex(/^[A-Z0-9]{4,10}$/i, 'Start code must be 4-10 alphanumeric characters')
    .optional(),
  autoGenerate: z.boolean().optional(),
});

export const assignStartCode = asyncHandler(async (req, res) => {
  const payload = assignCodeSchema.parse(req.body);

  let code = payload.startCode?.toUpperCase();

  if (payload.autoGenerate || !code) {
    code = generateStartCode();
  }

  const existing = await Team.findOne({ startCode: code });
  if (existing && existing.id.toString() !== req.params.id) {
    throw httpError(409, 'Start code already in use');
  }

  const team = await Team.findByIdAndUpdate(
    req.params.id,
    { $set: { startCode: code } },
    { new: true, runValidators: true },
  );

  if (!team) {
    throw httpError(404, 'Team not found');
  }

  res.json({ message: 'Start code assigned', team });
});

