import { Router } from 'express';
import { getProgress, updateStatus, uploadPhoto } from '../controllers/students.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();
router.get('/progress', verifyToken, checkRole(['student', 'admin']), getProgress);
router.put('/status', verifyToken, checkRole(['student', 'admin']), updateStatus);
router.post('/upload-photo', verifyToken, checkRole(['student']), upload.single('photo'), uploadPhoto);
export default router;
