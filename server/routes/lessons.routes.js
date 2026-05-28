import { Router } from 'express';
import { getLessons, scheduleLesson, submitFeedback } from '../controllers/lessons.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', verifyToken, getLessons);
router.post('/', verifyToken, scheduleLesson);
router.post('/:id/feedback', verifyToken, submitFeedback);
export default router;
