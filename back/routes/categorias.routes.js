import { Router } from 'express';
import { createCategoria, listCategorias } from '../controllers/categorias.controller.js';

const router = Router();

router.post('/', createCategoria);
router.get('/', listCategorias);

export default router;
