import { customAlphabet } from 'nanoid';

const nano = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

export const generateStartCode = () => {
  return nano();
};

