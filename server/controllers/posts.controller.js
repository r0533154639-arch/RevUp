import pool from '../config/db.js';
import { asyncHandler } from '../utils/controllerFactory.js';

export const getPosts = asyncHandler(async (req, res) => {
  const userId = req.user?.id ?? null;
  const [rows] = await pool.query(
    `SELECT p.*, u.name AS author_name, u.profile_image AS author_image,
            (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id AND pl.reaction = 'like') AS likes_count,
            (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id AND pl.reaction = 'dislike') AS dislikes_count,
            (SELECT reaction FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) AS my_reaction,
            (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id) AS comments_count
     FROM posts p
     JOIN users u ON u.id = p.instructor_id
     ORDER BY p.created_at DESC`,
    [userId]
  );
  res.json(rows);
});

export const getComments = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT pc.*, u.name AS author_name, u.profile_image AS author_image
     FROM post_comments pc
     JOIN users u ON u.id = pc.user_id
     WHERE pc.post_id = ?
     ORDER BY pc.created_at ASC`,
    [req.params.id]
  );
  const map = {};
  const roots = [];
  rows.forEach(r => { map[r.id] = { ...r, replies: [] }; });
  rows.forEach(r => {
    if (r.parent_comment_id) map[r.parent_comment_id]?.replies.push(map[r.id]);
    else roots.push(map[r.id]);
  });
  res.json(roots);
});

export const createPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const [result] = await pool.query(
    'INSERT INTO posts (title, content, instructor_id) VALUES (?, ?, ?)',
    [title, content, req.user.id]
  );
  res.status(201).json({ id: result.insertId });
});

export const updatePost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const { id } = req.params;
  const isAdmin = req.user.role === 'admin';
  const [result] = await pool.query(
    `UPDATE posts SET title = ?, content = ? WHERE id = ? ${isAdmin ? '' : 'AND instructor_id = ?'}`,
    isAdmin ? [title, content, id] : [title, content, id, req.user.id]
  );
  if (result.affectedRows === 0) return res.status(403).json({ message: 'אין הרשאה' });
  res.json({ success: true });
});

export const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isAdmin = req.user.role === 'admin';
  const [result] = await pool.query(
    `DELETE FROM posts WHERE id = ? ${isAdmin ? '' : 'AND instructor_id = ?'}`,
    isAdmin ? [id] : [id, req.user.id]
  );
  if (result.affectedRows === 0) return res.status(403).json({ message: 'אין הרשאה' });
  res.json({ success: true });
});

export const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { reaction } = req.body;

  if (!reaction) {
    await pool.query('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [id, userId]);
  } else {
    await pool.query(
      'INSERT INTO post_likes (post_id, user_id, reaction) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE reaction = ?',
      [id, userId, reaction, reaction]
    );
  }
  res.json({ success: true });
});

export const addComment = asyncHandler(async (req, res) => {
  const { content, parent_comment_id } = req.body;
  if (!content?.trim()) return res.status(400).json({ message: 'תוכן ריק' });
  const [result] = await pool.query(
    'INSERT INTO post_comments (post_id, user_id, content, parent_comment_id) VALUES (?, ?, ?, ?)',
    [req.params.id, req.user.id, content.trim(), parent_comment_id ?? null]
  );
  const [[comment]] = await pool.query(
    `SELECT pc.*, u.name AS author_name, u.profile_image AS author_image
     FROM post_comments pc JOIN users u ON u.id = pc.user_id WHERE pc.id = ?`,
    [result.insertId]
  );
  res.status(201).json({ ...comment, replies: [] });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const isAdmin = req.user.role === 'admin';
  const [result] = await pool.query(
    `DELETE FROM post_comments WHERE id = ? ${isAdmin ? '' : 'AND user_id = ?'}`,
    isAdmin ? [commentId] : [commentId, req.user.id]
  );
  if (result.affectedRows === 0) return res.status(403).json({ message: 'אין הרשאה' });
  res.json({ success: true });
});
