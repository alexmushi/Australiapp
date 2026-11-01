import { Router } from 'express';
import {
  createCategoria,
  deleteCategoria,
  listCategorias,
  updateCategoria,
} from '../controllers/categorias.controller.js';

const router = Router();

router.get('/', listCategorias);
router.post('/', createCategoria);
router.put('/:id', updateCategoria);
router.delete('/:id', deleteCategoria);

export default router;
