import { fetchPosts, fetchComments, createPost as createPostService, updatePost as updatePostService, deletePost as deletePostService, setReaction, addComment as addCommentService, removeComment } from '../services/post.service.js';
import { asyncHandler } from '../utils/controllerFactory.js';

export const getPosts      = asyncHandler(async (req, res) => res.json(await fetchPosts(req.user?.id)));
export const getComments   = asyncHandler(async (req, res) => res.json(await fetchComments(req.params.id)));
export const createPost    = asyncHandler(async (req, res) => res.status(201).json({ id: await createPostService(req.user.id, req.body) }));
export const updatePost    = asyncHandler(async (req, res) => { await updatePostService(req.params.id, req.user.id, req.user.role, req.body); res.json({ success: true }); });
export const deletePost    = asyncHandler(async (req, res) => { await deletePostService(req.params.id, req.user.id, req.user.role); res.json({ success: true }); });
export const toggleLike    = asyncHandler(async (req, res) => { await setReaction(req.params.id, req.user.id, req.body.reaction); res.json({ success: true }); });
export const addComment    = asyncHandler(async (req, res) => res.status(201).json(await addCommentService(req.params.id, req.user.id, req.body)));
export const deleteComment = asyncHandler(async (req, res) => { await removeComment(req.params.commentId, req.user.id, req.user.role); res.json({ success: true }); });
