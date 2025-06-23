import { Router } from 'express';
import { updateCurrency } from '../controllers/usuarios.controller.js';

const router = Router();

router.put('/:id/currency', updateCurrency);

export default router;