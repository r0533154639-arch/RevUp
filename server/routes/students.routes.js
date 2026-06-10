import { Router } from 'express';
import { getProgress, updateStatus, getMyStudents, selectInstructor, getAchievements, getMyInstructor, uploadPhoto } from '../controllers/students.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();
router.get('/progress', verifyToken, checkRole(['student', 'admin']), getProgress);
router.put('/status', verifyToken, checkRole(['student', 'admin']), updateStatus);
router.get('/my-instructor', verifyToken, checkRole(['student']), getMyInstructor);
router.put('/choose-instructor', verifyToken, checkRole(['student']), selectInstructor);
router.get('/my-students', verifyToken, checkRole(['instructor', 'admin']), getMyStudents);
router.get('/achievements', verifyToken, checkRole(['instructor', 'admin']), getAchievements);
router.post('/upload-photo', verifyToken, checkRole(['student']), upload.single('photo'), uploadPhoto);
export default router;
