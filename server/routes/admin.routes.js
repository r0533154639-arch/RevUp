import express from 'express';
import { getStudents, updateStatus, getInstructors, getAchievements, getPosts, getComments, blockUser, getUsers } from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/users', authenticate, authorize(['admin']), getUsers);
router.get('/students', authenticate, authorize(['admin']), getStudents);
router.put('/students/:studentId/status', authenticate, authorize(['admin']), updateStatus);
router.put('/users/:userId/block', authenticate, authorize(['admin']), blockUser);
router.get('/instructors', authenticate, authorize(['admin']), getInstructors);
router.get('/instructors/:instructorId/achievements', authenticate, authorize(['admin']), getAchievements);
router.get('/posts', authenticate, authorize(['admin']), getPosts);
router.get('/comments', authenticate, authorize(['admin']), getComments);

export default router;