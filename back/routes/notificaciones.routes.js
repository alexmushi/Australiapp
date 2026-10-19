import { Router } from 'express';
import { listNotificaciones } from '../controllers/notificaciones.controller.js';

const router = Router();

router.get('/', listNotificaciones);

export default router;
