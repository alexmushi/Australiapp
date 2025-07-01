import { Router } from 'express';
import { summaryController } from '../controllers/reports.controller.js';

const router = Router();

router.get('/summary', summaryController);

export default router;
