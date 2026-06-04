import { Router } from 'express';
import { getInstructors, getSchedule, approveLesson } from '../controllers/instructors.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', getInstructors);
router.get('/:id/schedule', verifyToken, checkRole(['instructor', 'admin']), getSchedule);
router.put('/lessons/:id/approve', verifyToken, checkRole(['instructor']), approveLesson);
export default router;
