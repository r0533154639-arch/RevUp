import { Router } from 'express';
import { getInstructors, getSchedule, approveLesson, uploadPhoto, completeProfile } from '../controllers/instructors.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();
router.get('/', getInstructors);
router.post('/complete-profile', verifyToken, checkRole(['instructor']), completeProfile);
router.post('/upload-photo', verifyToken, upload.single('photo'), uploadPhoto);
router.get('/:id/schedule', verifyToken, checkRole(['instructor', 'admin']), getSchedule);
router.put('/lessons/:id/approve', verifyToken, checkRole(['instructor', 'admin']), approveLesson);
export default router;
