import { Router } from 'express';

import {
  assignStartCode,
  createTeam,
  getTeam,
  listTeams,
  updateTeam,
} from '../controllers/teamController.js';

const router = Router();

router.get('/', listTeams);
router.post('/', createTeam);
router.get('/:id', getTeam);
router.patch('/:id', updateTeam);
router.post('/:id/start-code', assignStartCode);

export default router;

