import { Router } from 'express';
import { createReviewer } from '../controllers/reviewers.controller.js';

const router = Router();

router.post('/', createReviewer);

export default router;