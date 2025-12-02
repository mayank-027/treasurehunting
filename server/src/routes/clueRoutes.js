import { Router } from 'express';

import {
  createClueAssignment,
  deleteClueAssignment,
  getClueAssignmentResults,
  listClueAssignments,
} from '../controllers/clueAssignmentController.js';

const router = Router();

router.get('/', listClueAssignments);
router.post('/', createClueAssignment);
router.delete('/:id', deleteClueAssignment);
router.get('/:id/results', getClueAssignmentResults);

export default router;

