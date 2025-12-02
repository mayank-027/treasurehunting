import { Router } from 'express';

import {
  getGameStats,
  getLeaderboard,
  getUnlockCodes,
  startGame,
  unlockNextRound,
  verifyQrScan,
} from '../controllers/gameController.js';

const router = Router();

router.post('/start', startGame);
router.post('/qr-scan', verifyQrScan);
router.post('/unlock', unlockNextRound);
router.get('/leaderboard', getLeaderboard);
router.get('/stats', getGameStats);
router.get('/unlock-codes', getUnlockCodes);

export default router;

