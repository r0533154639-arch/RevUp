import { Router } from 'express';
import { getTests, scheduleTest, submitAppeal, getTestStatus, requestTest, getMyTestRequests, scheduleTestByInstructor } from '../controllers/tests.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/status', verifyToken, checkRole(['student']), getTestStatus);
router.post('/request', verifyToken, checkRole(['student']), requestTest);
router.get('/requests', verifyToken, checkRole(['instructor']), getMyTestRequests);
router.post('/schedule', verifyToken, checkRole(['instructor']), scheduleTestByInstructor);
router.get('/', verifyToken, checkRole(['student', 'admin']), getTests);
router.post('/', verifyToken, checkRole(['student', 'admin']), scheduleTest);
router.post('/:id/appeal', verifyToken, checkRole(['student', 'admin']), submitAppeal);
export default router;
