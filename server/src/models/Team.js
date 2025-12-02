import { Schema, model } from 'mongoose';

const progressSchema = new Schema(
  {
    roundNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'qr_found', 'unlocked'],
      default: 'pending',
    },
    qrScanTime: { type: Date },
    unlockTime: { type: Date },
    qualified: { type: Boolean }, // whether the team met the time limit for this round
  },
  { _id: false },
);

const teamSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    startCode: { type: String, required: true, unique: true },
    currentRoundNumber: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['not_started', 'playing', 'locked', 'completed'],
      default: 'not_started',
    },
    progress: { type: [progressSchema], default: [] },
    totalTimeSeconds: { type: Number, default: 0 },
    lastScanTime: { type: Date },
  },
  { timestamps: true },
);

export const Team = model('Team', teamSchema);

