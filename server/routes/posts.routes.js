import { Router } from 'express';
import { getPosts, createPost, updatePost, deletePost, toggleLike, getComments, addComment, deleteComment } from '../controllers/posts.controller.js';
import { verifyToken, optionalToken } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', optionalToken, getPosts);
router.get('/:id/comments', getComments);
router.post('/', verifyToken, createPost);
router.put('/:id', verifyToken, updatePost);
router.delete('/:id', verifyToken, deletePost);
router.post('/:id/like', verifyToken, toggleLike);
router.post('/:id/comments', verifyToken, addComment);
router.delete('/:id/comments/:commentId', verifyToken, deleteComment);
export default router;
