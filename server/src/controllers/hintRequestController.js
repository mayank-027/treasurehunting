import { Types } from 'mongoose';
import { z } from 'zod';

import { HintRequest } from '../models/HintRequest.js';
import { Team } from '../models/Team.js';
import { ClueAssignment } from '../models/ClueAssignment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

const requestHintSchema = z.object({
  teamId: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid team id'),
  roundNumber: z.coerce.number().int().positive(),
});

// Team requests a hint
export const requestHint = asyncHandler(async (req, res) => {
  const payload = requestHintSchema.parse(req.body);

  const team = await Team.findById(payload.teamId);
  if (!team) {
    throw httpError(404, 'Team not found');
  }

  // Check if there's already a pending request for this team and round
  const existingRequest = await HintRequest.findOne({
    teamId: payload.teamId,
    roundNumber: payload.roundNumber,
    status: 'pending',
  });

  if (existingRequest) {
    throw httpError(400, 'You already have a pending hint request for this round');
  }

  // Find the assignment for this team and round
  const assignment = await ClueAssignment.findOne({
    roundNumber: payload.roundNumber,
    teamIds: payload.teamId,
  });

  if (!assignment) {
    throw httpError(404, 'No assignment found for this team and round');
  }

  const hintRequest = await HintRequest.create({
    teamId: payload.teamId,
    roundNumber: payload.roundNumber,
    assignmentId: assignment._id,
    status: 'pending',
  });

  res.status(201).json({
    message: 'Hint request submitted successfully',
    request: {
      id: hintRequest._id,
      status: hintRequest.status,
      requestedAt: hintRequest.requestedAt,
    },
  });
});

// Team checks their hint request status and gets hint if approved
export const getMyHintRequest = asyncHandler(async (req, res) => {
  const teamId = req.query.teamId;
  const roundNumber = Number(req.query.roundNumber);

  if (!teamId || !Types.ObjectId.isValid(teamId)) {
    throw httpError(400, 'Invalid team id');
  }

  if (!roundNumber || isNaN(roundNumber)) {
    throw httpError(400, 'Invalid round number');
  }

  const request = await HintRequest.findOne({
    teamId,
    roundNumber,
  }).sort({ createdAt: -1 }); // Get the most recent request

  if (!request) {
    return res.json({ request: null, hint: null });
  }

  let hint = null;
  if (request.status === 'approved' && request.assignmentId) {
    const assignment = await ClueAssignment.findById(request.assignmentId);
    if (assignment && assignment.hint) {
      hint = assignment.hint;
    }
  }

  res.json({
    request: {
      id: request._id,
      status: request.status,
      requestedAt: request.requestedAt,
      reviewedAt: request.reviewedAt,
    },
    hint, // Only returned if status is 'approved'
  });
});

// Admin gets all hint requests (with filters)
export const listHintRequests = asyncHandler(async (req, res) => {
  const status = req.query.status;
  const roundNumber = req.query.roundNumber ? Number(req.query.roundNumber) : undefined;

  const filter = {};
  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    filter.status = status;
  }
  if (roundNumber) {
    filter.roundNumber = roundNumber;
  }

  const requests = await HintRequest.find(filter)
    .populate('teamId', 'name email')
    .populate('assignmentId', 'roundNumber clueText')
    .sort({ createdAt: -1 });

  res.json({
    requests: requests.map((req) => {
      const teamId = req.teamId;
      const assignmentId = req.assignmentId;
      
      return {
        id: req._id,
        team: {
          id: teamId instanceof Types.ObjectId ? teamId.toString() : teamId._id.toString(),
          name: teamId instanceof Types.ObjectId ? 'Unknown' : teamId.name,
          email: teamId instanceof Types.ObjectId ? 'Unknown' : teamId.email,
        },
        roundNumber: req.roundNumber,
        assignment: assignmentId && !(assignmentId instanceof Types.ObjectId)
          ? {
              id: assignmentId._id.toString(),
              roundNumber: assignmentId.roundNumber,
              clueText: assignmentId.clueText,
            }
          : null,
        status: req.status,
        requestedAt: req.requestedAt,
        reviewedAt: req.reviewedAt,
        reviewedBy: req.reviewedBy,
      };
    }),
  });
});

// Admin approves a hint request
export const approveHintRequest = asyncHandler(async (req, res) => {
  const requestId = req.params.id;

  if (!Types.ObjectId.isValid(requestId)) {
    throw httpError(400, 'Invalid request id');
  }

  const hintRequest = await HintRequest.findById(requestId);
  if (!hintRequest) {
    throw httpError(404, 'Hint request not found');
  }

  if (hintRequest.status !== 'pending') {
    throw httpError(400, 'This hint request has already been reviewed');
  }

  hintRequest.status = 'approved';
  hintRequest.reviewedAt = new Date();
  hintRequest.reviewedBy = 'admin'; // You can enhance this to track actual admin user
  await hintRequest.save();

  res.json({
    message: 'Hint request approved',
    request: {
      id: hintRequest._id,
      status: hintRequest.status,
      reviewedAt: hintRequest.reviewedAt,
    },
  });
});

// Admin rejects a hint request
export const rejectHintRequest = asyncHandler(async (req, res) => {
  const requestId = req.params.id;

  if (!Types.ObjectId.isValid(requestId)) {
    throw httpError(400, 'Invalid request id');
  }

  const hintRequest = await HintRequest.findById(requestId);
  if (!hintRequest) {
    throw httpError(404, 'Hint request not found');
  }

  if (hintRequest.status !== 'pending') {
    throw httpError(400, 'This hint request has already been reviewed');
  }

  hintRequest.status = 'rejected';
  hintRequest.reviewedAt = new Date();
  hintRequest.reviewedBy = 'admin';
  await hintRequest.save();

  res.json({
    message: 'Hint request rejected',
    request: {
      id: hintRequest._id,
      status: hintRequest.status,
      reviewedAt: hintRequest.reviewedAt,
    },
  });
});

