import { Router } from 'express';
import { listDivisaCodes, listDivisas } from '../controllers/divisas.controller.js';

const router = Router();

router.get('/', listDivisaCodes);
router.get('/rates', listDivisas);

export default router;
