import { Router } from 'express';
import { listDivisaCodes, listDivisas } from '../controllers/divisas.controller.js';

const router = Router();

router.get('/', listDivisaCodes);
router.get('/all', listDivisas);

export default router;
