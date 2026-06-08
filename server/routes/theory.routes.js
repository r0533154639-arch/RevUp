import { Router } from 'express';
import { getQuestions } from '../controllers/theory.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/questions', verifyToken, getQuestions);
export default router;
