import { Router } from 'express';

import { teamLogin, teamSignup } from '../controllers/teamAuthController.js';

const router = Router();

router.post('/signup', teamSignup);
router.post('/login', teamLogin);

export default router;

