import { Router } from 'express';
import { getQuestions, submitExam, getProgress } from '../controllers/theory.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/questions', verifyToken, checkRole(['student']), getQuestions);
router.post('/submit', verifyToken, checkRole(['student']), submitExam);
router.get('/progress', verifyToken, checkRole(['student']), getProgress);
export default router;
