import { z } from 'zod';

import { ClueAssignment } from '../models/ClueAssignment.js';
import { Round } from '../models/Round.js';
import { Team } from '../models/Team.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { generateQrId } from '../utils/generateQrId.js';

const upsertSchema = z.object({
  // coerce in case the frontend sends strings
  roundNumber: z.coerce.number().int().positive(),
  clueText: z.string().min(5),
  description: z.string().optional(),
  hint: z.string().optional(),
  unlockCode: z.string().min(3),
  timeLimitSeconds: z.coerce.number().int().positive(),
  teamIds: z.array(z.string()).min(1),
});

export const createClueAssignment = asyncHandler(async (req, res) => {
  const payload = upsertSchema.parse(req.body);

  const roundExists = await Round.exists({ roundNumber: payload.roundNumber });
  if (!roundExists) {
    throw httpError(400, `Round ${payload.roundNumber} does not exist`);
  }

  const teamsCount = await Team.countDocuments({ _id: { $in: payload.teamIds } });
  if (teamsCount !== payload.teamIds.length) {
    throw httpError(400, 'One or more teams not found');
  }

  const existingCode = await ClueAssignment.findOne({ unlockCode: payload.unlockCode });
  if (existingCode) {
    throw httpError(409, 'Unlock code must be unique');
  }

  const assignment = await ClueAssignment.create({
    roundNumber: payload.roundNumber,
    clueText: payload.clueText,
    description: payload.description,
    hint: payload.hint,
    unlockCode: payload.unlockCode.toUpperCase(),
    qrId: generateQrId(payload.roundNumber),
    timeLimitSeconds: payload.timeLimitSeconds,
    teamIds: payload.teamIds,
  });

  res.status(201).json(assignment);
});

export const listClueAssignments = asyncHandler(async (_req, res) => {
  const items = await ClueAssignment.find().sort({ roundNumber: 1, createdAt: 1 });
  res.json(items);
});

export const getClueAssignmentResults = asyncHandler(async (req, res) => {
  const assignment = await ClueAssignment.findById(req.params.id);
  if (!assignment) {
    throw httpError(404, 'Clue assignment not found');
  }

  const teams = await Team.find({ _id: { $in: assignment.teamIds } });

  const results = teams
    .map((team) => {
      const entry = team.progress.find((p) => p.roundNumber === assignment.roundNumber);
      if (!entry || !entry.qrScanTime || !entry.unlockTime) {
        return null;
      }

      const durationSeconds =
        (entry.unlockTime.getTime() - entry.qrScanTime.getTime()) / 1000;

      return {
        teamId: team._id,
        teamName: team.name,
        durationSeconds,
        qualified: entry.qualified ??
          (assignment.timeLimitSeconds
            ? durationSeconds <= assignment.timeLimitSeconds
            : true),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.durationSeconds - b.durationSeconds);

  res.json(results);
});

export const deleteClueAssignment = asyncHandler(async (req, res) => {
  const deleted = await ClueAssignment.findByIdAndDelete(req.params.id);
  if (!deleted) {
    throw httpError(404, 'Clue assignment not found');
  }
  res.status(204).send();
});

