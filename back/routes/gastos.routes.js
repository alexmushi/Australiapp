import { Router } from 'express';
import { create } from '../controllers/gastos.controller.js';

const router = Router();

router.post('/', create);

export default router;

