import { Router } from 'express';

import {
  createRound,
  deleteRound,
  getRound,
  listRounds,
  updateRound,
} from '../controllers/roundController.js';

const router = Router();

router.get('/', listRounds);
router.post('/', createRound);
router.get('/:id', getRound);
router.patch('/:id', updateRound);
router.delete('/:id', deleteRound);

export default router;

