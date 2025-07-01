import { Router } from 'express';
import { summaryController, categoryController } from '../controllers/reports.controller.js';

const router = Router();

router.get('/summary', summaryController);
router.get('/category/:id', categoryController);

export default router;