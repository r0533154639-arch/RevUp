import { Router } from 'express';
import { getLessons, scheduleLesson, submitFeedback } from '../controllers/lessons.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', verifyToken, checkRole(['student', 'instructor']), getLessons);
router.post('/', verifyToken, checkRole(['student']), scheduleLesson);
router.post('/:id/feedback', verifyToken, checkRole(['instructor']), submitFeedback);
export default router;
