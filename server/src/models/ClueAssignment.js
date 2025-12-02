import { Schema, model, Types } from 'mongoose';

const clueAssignmentSchema = new Schema(
  {
    roundNumber: { type: Number, required: true },
    clueText: { type: String, required: true },
    description: { type: String },
    hint: { type: String },
    unlockCode: { type: String, required: true, unique: true },
    qrId: { type: String, required: true, unique: true },
    teamIds: { type: [Types.ObjectId], ref: 'Team', required: true },
  },
  { timestamps: true },
);

export const ClueAssignment = model('ClueAssignment', clueAssignmentSchema);

