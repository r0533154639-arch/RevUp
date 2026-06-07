import { Router } from 'express';
import { getPosts, createPost, updatePost } from '../controllers/posts.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', getPosts);
router.post('/', verifyToken, createPost);
router.put('/:id', verifyToken, updatePost);
export default router;
