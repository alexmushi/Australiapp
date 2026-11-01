import { Router } from 'express';
import {
  createReviewerController,
  deleteReviewerController,
  listReviewersController,
} from '../controllers/reviewers.controller.js';
import { requireOwner } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(requireOwner);
router.get('/', listReviewersController);
router.post('/', createReviewerController);
router.delete('/:id', deleteReviewerController);

export default router;
