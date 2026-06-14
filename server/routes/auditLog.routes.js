import { Router } from 'express';
import { getLogs } from '../controllers/auditLog.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', verifyToken, checkRole(['admin']), getLogs);
export default router;
