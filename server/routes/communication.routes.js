import { Router } from 'express';
import { submitLessonFeedback, getMyLessonFeedback, submitContact, getContacts, getLessonFeedback } from '../controllers/communication.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/feedback', verifyToken, checkRole(['instructor']), submitLessonFeedback);
router.get('/feedback', verifyToken, checkRole(['student']), getMyLessonFeedback);
router.get('/feedback/:lessonId', verifyToken, getLessonFeedback);
router.post('/contact', verifyToken, submitContact);
router.get('/contact', verifyToken, checkRole(['admin']), getContacts);
export default router;
