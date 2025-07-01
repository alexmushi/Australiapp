import { Router } from 'express';
import {
  createCategoria,
  getCategorias,
} from '../controllers/categorias.controller.js';

const router = Router();

router.get('/', getCategorias);
router.post('/', createCategoria);

export default router;
