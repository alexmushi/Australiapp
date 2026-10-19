import { Router } from 'express';
import {
  deleteIngresoController,
  listIngresosController,
  upsertIngresoController,
} from '../controllers/ingresos.controller.js';

const router = Router();

router.get('/', listIngresosController);
router.put('/:year/:month', upsertIngresoController);
router.delete('/:year/:month', deleteIngresoController);

export default router;
