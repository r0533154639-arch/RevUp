import { Router } from 'express';
import { getDashboard, blockUser, updateCell, getStudents, updateStatus, getInstructors, getAchievements, getPosts, getComments, getUsers, getPendingInstructorsList, approveInstructorById } from '../controllers/admin.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/dashboard', verifyToken, checkRole(['admin']), getDashboard);
router.get('/users', verifyToken, checkRole(['admin']), getUsers);
router.get('/students', verifyToken, checkRole(['admin']), getStudents);
router.put('/students/:studentId/status', verifyToken, checkRole(['admin']), updateStatus);
router.put('/users/:id/block', verifyToken, checkRole(['admin']), blockUser);
router.put('/table/:table/:id', verifyToken, checkRole(['admin']), updateCell);
router.get('/instructors', verifyToken, checkRole(['admin']), getInstructors);
router.get('/instructors/pending', verifyToken, checkRole(['admin']), getPendingInstructorsList);
router.put('/instructors/:userId/approve', verifyToken, checkRole(['admin']), approveInstructorById);
router.get('/instructors/:instructorId/achievements', verifyToken, checkRole(['admin']), getAchievements);
router.get('/posts', verifyToken, checkRole(['admin']), getPosts);
router.get('/comments', verifyToken, checkRole(['admin']), getComments);
export default router;
