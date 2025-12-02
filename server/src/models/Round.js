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
  },
  { timestamps: true },
);

export const Round = model('Round', roundSchema);

