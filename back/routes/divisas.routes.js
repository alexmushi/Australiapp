import { Router } from 'express';
import { listDivisaCodes, listDivisaRates } from '../controllers/divisas.controller.js';

const router = Router();

router.get('/', listDivisaCodes);
router.get('/rates', listDivisaRates);

export default router;
