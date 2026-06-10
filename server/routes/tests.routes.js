import { Router } from 'express';
import { getTests, scheduleTest, submitAppeal } from '../controllers/tests.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', verifyToken, checkRole(['student', 'admin']), getTests);
router.post('/', verifyToken, checkRole(['student', 'admin']), scheduleTest);
router.post('/:id/appeal', verifyToken, checkRole(['student', 'admin']), submitAppeal);
export default router;
