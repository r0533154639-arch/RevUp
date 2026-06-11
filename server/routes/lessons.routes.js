import { Router } from 'express';
import { getLessons, scheduleLesson, submitFeedback, approveLesson, rejectLesson, dismissLesson, getPendingCount, getMyNotifications } from '../controllers/lessons.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', verifyToken, checkRole(['student', 'instructor', 'admin']), getLessons);
router.post('/', verifyToken, checkRole(['student', 'admin']), scheduleLesson);
router.post('/:id/feedback', verifyToken, checkRole(['student', 'instructor', 'admin']), submitFeedback);
router.put('/:id/approve', verifyToken, checkRole(['instructor', 'admin']), approveLesson);
router.put('/:id/reject', verifyToken, checkRole(['instructor', 'admin']), rejectLesson);
router.delete('/:id', verifyToken, checkRole(['student']), dismissLesson);
router.get('/pending-count', verifyToken, checkRole(['instructor']), getPendingCount);
router.get('/notifications', verifyToken, getMyNotifications);
export default router;
