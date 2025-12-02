import { Router } from 'express';

import {
  createRound,
  deleteRound,
  getRound,
  listRounds,
  updateRound,
  updateRoundTimer,
} from '../controllers/roundController.js';

const router = Router();

router.get('/', listRounds);
router.post('/', createRound);
router.get('/:id', getRound);
router.patch('/:id', updateRound);
router.post('/:id/timer', updateRoundTimer);
router.delete('/:id', deleteRound);

export default router;

