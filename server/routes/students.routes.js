import { Router } from 'express';
import { getProgress, updateStatus } from '../controllers/students.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/progress', verifyToken, checkRole(['student', 'admin']), getProgress);
router.put('/status', verifyToken, checkRole(['student', 'admin']), updateStatus);
export default router;
