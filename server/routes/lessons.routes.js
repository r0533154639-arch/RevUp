import { Router } from 'express';
import { getLessons, scheduleLesson, submitFeedback } from '../controllers/lessons.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', verifyToken, checkRole(['student', 'instructor', 'admin']), getLessons);
router.post('/', verifyToken, checkRole(['student', 'admin']), scheduleLesson);
router.post('/:id/feedback', verifyToken, checkRole(['instructor', 'admin']), submitFeedback);
export default router;
