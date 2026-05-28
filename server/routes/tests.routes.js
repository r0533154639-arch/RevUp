import { Router } from 'express';
import { getTests, scheduleTest, submitAppeal } from '../controllers/tests.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', verifyToken, getTests);
router.post('/', verifyToken, scheduleTest);
router.post('/:id/appeal', verifyToken, submitAppeal);
export default router;
