import { Router } from 'express';
import { getInstructors, getSchedule, approveLesson } from '../controllers/instructors.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', getInstructors);
router.get('/:id/schedule', verifyToken, getSchedule);
router.put('/lessons/:id/approve', verifyToken, approveLesson);
export default router;
