import { Types } from 'mongoose';
import { z } from 'zod';

import { Round } from '../models/Round.js';
import { ClueAssignment } from '../models/ClueAssignment.js';
import { Team } from '../models/Team.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

const startSchema = z.object({
  startCode: z.string().min(3),
});

const ensureProgressEntry = (team, roundNumber) => {
  const hasEntry = team.progress.some((p) => p.roundNumber === roundNumber);
  if (!hasEntry) {
    team.progress.push({ roundNumber });
  }
};

const findRoundOrThrow = async (roundNumber) => {
  const round = await Round.findOne({ roundNumber });
  if (!round) {
    throw httpError(404, `Round ${roundNumber} not found`);
  }
  return round;
};

const sanitizeTeam = (team) => ({
  id: team._id,
  name: team.name,
  status: team.status,
  currentRoundNumber: team.currentRoundNumber,
});

export const startGame = asyncHandler(async (req, res) => {
  const payload = startSchema.parse(req.body);
  const team = await Team.findOne({ startCode: payload.startCode });

  if (!team) {
    throw httpError(404, 'Invalid start code');
  }

  const assignment = await ClueAssignment.findOne({
    roundNumber: team.currentRoundNumber,
    teamIds: team._id,
  });
  if (!assignment) {
    throw httpError(400, 'No clue assignment configured for this team and round');
  }

  await findRoundOrThrow(team.currentRoundNumber); // ensure round exists
  ensureProgressEntry(team, team.currentRoundNumber);

  team.status = 'playing';
  await team.save();

  const totalRounds = await Round.countDocuments();

  // Don't return hint - teams must request it and get approval
  const { hint, ...assignmentWithoutHint } = assignment.toObject();

  res.json({
    team: sanitizeTeam(team),
    round: assignmentWithoutHint,
    totalRounds,
  });
});

const qrSchema = z.object({
  teamId: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid team id'),
  qrId: z.string().min(3),
});

export const verifyQrScan = asyncHandler(async (req, res) => {
  const payload = qrSchema.parse(req.body);

  const team = await Team.findById(payload.teamId);
  if (!team) {
    throw httpError(404, 'Team not found');
  }

  if (team.status !== 'playing') {
    throw httpError(400, 'Team is not currently playing');
  }

  const assignment = await ClueAssignment.findOne({
    qrId: payload.qrId,
    teamIds: team._id,
  });

  if (!assignment || assignment.roundNumber !== team.currentRoundNumber) {
    throw httpError(400, 'QR code does not match the active round for this team');
  }

  ensureProgressEntry(team, assignment.roundNumber);
  const progress = team.progress.find((p) => p.roundNumber === assignment.roundNumber);
  if (progress) {
    progress.status = 'qr_found';
    progress.qrScanTime = new Date();
  }
  team.status = 'locked';
  team.lastScanTime = new Date();
  await team.save();

  res.json({
    message: 'Location verified. Await unlock code.',
    team: sanitizeTeam(team),
  });
});

const unlockSchema = z.object({
  teamId: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid team id'),
  unlockCode: z.string().min(3),
});

const computeTotalTime = (team) => {
  return team.progress.reduce((total, entry) => {
    if (entry.unlockTime && entry.qrScanTime) {
      return total + (entry.unlockTime.getTime() - entry.qrScanTime.getTime()) / 1000;
    }
    return total;
  }, 0);
};

export const unlockNextRound = asyncHandler(async (req, res) => {
  const payload = unlockSchema.parse(req.body);
  const team = await Team.findById(payload.teamId);
  if (!team) {
    throw httpError(404, 'Team not found');
  }

  if (team.status !== 'locked') {
    throw httpError(400, 'Team is not waiting for unlock');
  }

  const activeRound = await findRoundOrThrow(team.currentRoundNumber);

  const assignment = await ClueAssignment.findOne({
    roundNumber: activeRound.roundNumber,
    teamIds: team._id,
  });

  const expectedCode = assignment?.unlockCode ?? activeRound.unlockCode;

  if (expectedCode.toUpperCase() !== payload.unlockCode.toUpperCase()) {
    throw httpError(400, 'Unlock code is incorrect');
  }

  const progress = team.progress.find((p) => p.roundNumber === activeRound.roundNumber);
  if (progress) {
    progress.status = 'unlocked';
    progress.unlockTime = new Date();

    if (progress.qrScanTime && assignment?.timeLimitSeconds) {
      const durationSeconds =
        (progress.unlockTime.getTime() - progress.qrScanTime.getTime()) / 1000;
      progress.qualified = durationSeconds <= assignment.timeLimitSeconds;
    }
  }

  const nextRound = await Round.findOne({ roundNumber: activeRound.roundNumber + 1 });

  if (nextRound) {
    team.currentRoundNumber = nextRound.roundNumber;
    ensureProgressEntry(team, team.currentRoundNumber);
    team.status = 'playing';
  } else {
    team.status = 'completed';
    team.totalTimeSeconds = computeTotalTime(team);
  }

  await team.save();

  let nextRoundData = null;
  if (nextRound) {
    const nextAssignment = await ClueAssignment.findOne({
      roundNumber: nextRound.roundNumber,
      teamIds: team._id,
    });

    if (nextAssignment) {
      // Don't return hint - teams must request it and get approval
      const { hint, ...assignmentWithoutHint } = nextAssignment.toObject();
      nextRoundData = assignmentWithoutHint;
    } else {
      // Fallback to round data if no assignment (shouldn't happen, but handle gracefully)
      nextRoundData = {
        roundNumber: nextRound.roundNumber,
        clueText: nextRound.clueText,
        description: nextRound.description,
      };
    }
  }

  res.json({
    message: nextRound ? 'Next round unlocked' : 'Treasure hunt completed',
    team: sanitizeTeam(team),
    nextRound: nextRoundData,
  });
});

export const getLeaderboard = asyncHandler(async (_req, res) => {
  const teams = await Team.find().sort({
    currentRoundNumber: -1,
    totalTimeSeconds: 1,
    updatedAt: -1,
  });

  const leaderboard = teams.map((team, index) => ({
    rank: index + 1,
    teamId: team._id,
    teamName: team.name,
    currentRound: team.currentRoundNumber,
    status: team.status,
    lastScanTime: team.lastScanTime,
    totalTimeSeconds: team.totalTimeSeconds,
  }));

  res.json(leaderboard);
});

export const getGameStats = asyncHandler(async (_req, res) => {
  const [totalRounds, activeTeams, completedHunts] = await Promise.all([
    Round.countDocuments(),
    Team.countDocuments({ status: { $in: ['playing', 'locked'] } }),
    Team.countDocuments({ status: 'completed' }),
  ]);

  res.json({ totalRounds, activeTeams, completedHunts });
});

export const getUnlockCodes = asyncHandler(async (_req, res) => {
  const [rounds, teams] = await Promise.all([
    Round.find().sort({ roundNumber: 1 }),
    Team.find(),
  ]);

  const unlockStatuses = rounds.map((round) => {
    const lockedTeams = teams.filter(
      (team) => team.status === 'locked' && team.currentRoundNumber === round.roundNumber,
    );
    const unlockedTeams = teams.filter((team) =>
      team.progress.some((p) => p.roundNumber === round.roundNumber && p.status === 'unlocked'),
    );

    const status = lockedTeams.length > 0 ? 'active' : unlockedTeams.length > 0 ? 'used' : 'pending';

    return {
      round: round.roundNumber,
      code: round.unlockCode,
      status,
    };
  });

  res.json(unlockStatuses);
});

