import { Router } from 'express';
import { getTests, scheduleTest, submitAppeal } from '../controllers/tests.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', verifyToken, checkRole(['student']), getTests);
router.post('/', verifyToken, checkRole(['student']), scheduleTest);
router.post('/:id/appeal', verifyToken, checkRole(['student']), submitAppeal);
export default router;
