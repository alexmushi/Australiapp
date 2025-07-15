import { Router } from 'express';
import { createCategoria, listCategorias } from '../controllers/categorias.controller.js';

const router = Router();

router.get('/', listCategorias);
router.post('/', createCategoria);

export default router;
