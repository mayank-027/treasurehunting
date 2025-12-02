import { Router } from 'express';

import authRoutes from './authRoutes.js';
import clueRoutes from './clueRoutes.js';
import gameRoutes from './gameRoutes.js';
import hintRoutes from './hintRoutes.js';
import roundRoutes from './roundRoutes.js';
import teamRoutes from './teamRoutes.js';
import teamAuthRoutes from './teamAuthRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clues', clueRoutes);
router.use('/rounds', roundRoutes);
router.use('/teams', teamRoutes);
router.use('/teams/auth', teamAuthRoutes);
router.use('/game', gameRoutes);
router.use('/hints', hintRoutes);

export default router;

