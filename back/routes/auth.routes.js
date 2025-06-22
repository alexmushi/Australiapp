import { Router } from 'express';
import { ping, register, login } from '../controllers/auth.controller.js';

const router = Router();

router.get('/ping', ping);
router.post('/register', register);
router.post('/login', login);

export default router;
