import { Router } from 'express';
import { createCategory } from '../controllers/categorias.controller.js';

const router = Router();

router.post('/', createCategory);

export default router;
