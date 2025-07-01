import { Router } from 'express';
import {
  summaryController,
  categoryController,
  summaryTableController,
} from '../controllers/reports.controller.js';

const router = Router();

router.get('/summary', summaryController);
router.get('/category/:id', categoryController);
router.get('/summary-table', summaryTableController);

export default router;