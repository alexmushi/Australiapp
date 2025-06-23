import { Router } from 'express';
import { listDivisaCodes } from '../controllers/divisas.controller.js';

const router = Router();

router.get('/', listDivisaCodes);

export default router;
