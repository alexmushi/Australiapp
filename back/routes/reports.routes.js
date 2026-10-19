import { Router } from 'express';
import {
  monthStatusController,
  summaryController,
  summaryTableController,
} from '../controllers/reports.controller.js';

const router = Router();

router.get('/summary', summaryController);
router.get('/summary-table', summaryTableController);
router.get('/month-status', monthStatusController);

export default router;
