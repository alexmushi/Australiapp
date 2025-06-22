import { Router } from 'express';
import { ping } from '../controllers/auth.controller.js';

const router = Router();

router.get('/ping', ping);

export default router;
