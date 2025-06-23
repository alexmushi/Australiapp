import { Router } from 'express';
import { createCategoria } from '../controllers/categorias.controller.js';

const router = Router();

router.post('/', createCategoria);

export default router;
