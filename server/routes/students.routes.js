import { Router } from 'express';
import { getProgress, updateStatus } from '../controllers/students.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/progress', verifyToken, getProgress);
router.put('/status', verifyToken, updateStatus);
export default router;
