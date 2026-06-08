import { Router } from 'express';
import { login, register, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

console.log('Auth routes loaded');

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticate, getMe);

console.log('Auth routes configured:', router.stack.length, 'routes');

export default router;
