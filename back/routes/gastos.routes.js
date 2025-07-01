import { Router } from 'express';
import { createGastoController } from '../controllers/gastos.controller.js';

const router = Router();

router.post('/', createGastoController);

export default router;
