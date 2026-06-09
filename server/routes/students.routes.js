import { Router } from 'express';
import { getProgress, updateStatus, getMyStudents, selectInstructor, getAchievements, getMyInstructor } from '../controllers/students.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/progress', verifyToken, checkRole(['student']), getProgress);
router.put('/status', verifyToken, checkRole(['student']), updateStatus);
router.get('/my-instructor', verifyToken, checkRole(['student']), getMyInstructor);
router.put('/choose-instructor', verifyToken, checkRole(['student']), selectInstructor);
router.get('/my-students', verifyToken, checkRole(['instructor']), getMyStudents);
router.get('/achievements', verifyToken, checkRole(['instructor']), getAchievements);
export default router;
