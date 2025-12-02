import { z } from 'zod';

import { Round } from '../models/Round.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateQrId } from '../utils/generateQrId.js';
import { httpError } from '../utils/httpError.js';

const roundBaseSchema = z.object({
  roundNumber: z.number().int().positive(),
  clueText: z.string().min(5),
  description: z.string().optional(),
  hint: z.string().optional(),
  unlockCode: z.string().min(3),
});

export const createRound = asyncHandler(async (req, res) => {
  const payload = roundBaseSchema.parse(req.body);

  const existing = await Round.findOne({ roundNumber: payload.roundNumber });
  if (existing) {
    throw httpError(409, `Round ${payload.roundNumber} already exists`);
  }

  const round = await Round.create({
    ...payload,
    qrId: generateQrId(payload.roundNumber),
  });

  res.status(201).json(round);
});

export const listRounds = asyncHandler(async (_req, res) => {
  const rounds = await Round.find().sort({ roundNumber: 1 });
  res.json(rounds);
});

export const getRound = asyncHandler(async (req, res) => {
  const round = await Round.findById(req.params.id);
  if (!round) {
    throw httpError(404, 'Round not found');
  }
  res.json(round);
});

const updateSchema = roundBaseSchema.partial();

export const updateRound = asyncHandler(async (req, res) => {
  const payload = updateSchema.parse(req.body);
  const round = await Round.findByIdAndUpdate(
    req.params.id,
    { $set: payload },
    { new: true, runValidators: true },
  );

  if (!round) {
    throw httpError(404, 'Round not found');
  }

  res.json(round);
});

export const deleteRound = asyncHandler(async (req, res) => {
  const round = await Round.findByIdAndDelete(req.params.id);
  if (!round) {
    throw httpError(404, 'Round not found');
  }
  res.status(204).send();
});

