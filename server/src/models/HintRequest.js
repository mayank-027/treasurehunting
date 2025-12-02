import { Schema, model } from 'mongoose';

const hintRequestSchema = new Schema(
  {
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    roundNumber: { type: Number, required: true },
    assignmentId: { type: Schema.Types.ObjectId, ref: 'ClueAssignment' }, // optional, for reference
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    requestedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { type: String }, // admin email or identifier
  },
  { timestamps: true },
);

// Index to ensure one pending request per team per round
hintRequestSchema.index({ teamId: 1, roundNumber: 1, status: 1 });

export const HintRequest = model('HintRequest', hintRequestSchema);

