import { Router } from 'express';
import { submitLessonFeedback, getMyLessonFeedback } from '../controllers/communication.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/feedback', verifyToken, checkRole(['instructor']), submitLessonFeedback);
router.get('/feedback', verifyToken, checkRole(['student']), getMyLessonFeedback);
export default router;
