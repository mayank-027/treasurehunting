import { Schema, model } from 'mongoose';

const roundSchema = new Schema(
  {
    roundNumber: { type: Number, required: true, unique: true },
    clueText: { type: String, required: true },
    description: { type: String },
    hint: { type: String },
    unlockCode: { type: String, required: true },
    qrId: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    // Admin-controlled round timer
    timerStatus: {
      type: String,
      enum: ['idle', 'running', 'paused', 'finished'],
      default: 'idle',
    },
    timerStartAt: { type: Date }, // when the timer was last started/resumed
    accumulatedSeconds: {
      type: Number,
      default: 0, // total active time (seconds) excluding current running segment
    },
  },
  { timestamps: true },
);

export const Round = model('Round', roundSchema);

