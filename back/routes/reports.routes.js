import { Router } from 'express';
import { summaryController, summaryTableController } from '../controllers/reports.controller.js';

const router = Router();

router.get('/summary', summaryController);
router.get('/summary-table', summaryTableController);

export default router;
