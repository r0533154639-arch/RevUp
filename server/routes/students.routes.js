import { Router } from 'express';
import { getProgress, updateStatus, getMyStudents, selectInstructor, getAchievements } from '../controllers/students.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/progress', verifyToken, checkRole(['student']), getProgress);
router.put('/status', verifyToken, checkRole(['student']), updateStatus);
router.get('/my-students', verifyToken, checkRole(['instructor']), getMyStudents);
router.get('/achievements', verifyToken, checkRole(['instructor']), getAchievements);
// TODO: להסיר כשיהיה תהליך בחירת מורה אמיתי
router.put('/choose-instructor', verifyToken, checkRole(['student']), selectInstructor);
export default router;
