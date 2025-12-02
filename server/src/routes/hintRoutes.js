import { Router } from 'express';

import {
  requestHint,
  getMyHintRequest,
  listHintRequests,
  approveHintRequest,
  rejectHintRequest,
} from '../controllers/hintRequestController.js';

const router = Router();

// Team routes
router.post('/request', requestHint);
router.get('/my-request', getMyHintRequest);

// Admin routes
router.get('/requests', listHintRequests);
router.post('/requests/:id/approve', approveHintRequest);
router.post('/requests/:id/reject', rejectHintRequest);

export default router;

