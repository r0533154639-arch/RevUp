import { Router } from 'express';
import { getDashboard, blockUser } from '../controllers/admin.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/dashboard', verifyToken, checkRole(['admin']), getDashboard);
router.put('/users/:id/block', verifyToken, checkRole(['admin']), blockUser);
export default router;
