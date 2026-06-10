import { Router } from 'express';
import { getLessons, scheduleLesson, submitFeedback, approveLesson, getPendingCount, getMyNotifications } from '../controllers/lessons.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', verifyToken, checkRole(['student', 'instructor', 'admin']), getLessons);
router.post('/', verifyToken, checkRole(['student', 'admin']), scheduleLesson);
router.post('/:id/feedback', verifyToken, checkRole(['student', 'instructor', 'admin']), submitFeedback);
router.put('/:id/approve', verifyToken, checkRole(['instructor', 'admin']), approveLesson);
router.get('/pending-count', verifyToken, checkRole(['instructor']), getPendingCount);
router.get('/notifications', verifyToken, getMyNotifications);
export default router;
