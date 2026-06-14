import pool from '../config/db.js';

export const fetchPosts = async (userId) => {
  const [rows] = await pool.query(
    `SELECT p.*, u.name AS author_name, u.profile_image AS author_image,
            (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id AND pl.reaction = 'like') AS likes_count,
            (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id AND pl.reaction = 'dislike') AS dislikes_count,
            (SELECT reaction FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) AS my_reaction,
            (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id) AS comments_count
     FROM posts p JOIN users u ON u.id = p.instructor_id
     ORDER BY p.created_at DESC`,
    [userId ?? null]
  );
  return rows;
};

export const fetchComments = async (postId) => {
  const [rows] = await pool.query(
    `SELECT pc.*, u.name AS author_name, u.profile_image AS author_image
     FROM post_comments pc JOIN users u ON u.id = pc.user_id
     WHERE pc.post_id = ? ORDER BY pc.created_at ASC`,
    [postId]
  );
  const map = {};
  const roots = [];
  rows.forEach(r => { map[r.id] = { ...r, replies: [] }; });
  rows.forEach(r => {
    if (r.parent_comment_id) map[r.parent_comment_id]?.replies.push(map[r.id]);
    else roots.push(map[r.id]);
  });
  return roots;
};

export const createPost = async (userId, { title, content }) => {
  const [result] = await pool.query(
    'INSERT INTO posts (title, content, instructor_id) VALUES (?, ?, ?)',
    [title, content, userId]
  );
  return result.insertId;
};

export const updatePost = async (postId, userId, role, { title, content }) => {
  const isAdmin = role === 'admin';
  const [result] = await pool.query(
    `UPDATE posts SET title = ?, content = ? WHERE id = ? ${isAdmin ? '' : 'AND instructor_id = ?'}`,
    isAdmin ? [title, content, postId] : [title, content, postId, userId]
  );
  if (result.affectedRows === 0) throw Object.assign(new Error('אין הרשאה'), { status: 403 });
};

export const deletePost = async (postId, userId, role) => {
  const isAdmin = role === 'admin';
  const [result] = await pool.query(
    `DELETE FROM posts WHERE id = ? ${isAdmin ? '' : 'AND instructor_id = ?'}`,
    isAdmin ? [postId] : [postId, userId]
  );
  if (result.affectedRows === 0) throw Object.assign(new Error('אין הרשאה'), { status: 403 });
};

export const setReaction = async (postId, userId, reaction) => {
  if (!reaction) {
    await pool.query('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
  } else {
    await pool.query(
      'INSERT INTO post_likes (post_id, user_id, reaction) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE reaction = ?',
      [postId, userId, reaction, reaction]
    );
  }
};

export const addComment = async (postId, userId, { content, parent_comment_id }) => {
  if (!content?.trim()) throw Object.assign(new Error('תוכן ריק'), { status: 400 });
  const [result] = await pool.query(
    'INSERT INTO post_comments (post_id, user_id, content, parent_comment_id) VALUES (?, ?, ?, ?)',
    [postId, userId, content.trim(), parent_comment_id ?? null]
  );
  const [[comment]] = await pool.query(
    `SELECT pc.*, u.name AS author_name, u.profile_image AS author_image
     FROM post_comments pc JOIN users u ON u.id = pc.user_id WHERE pc.id = ?`,
    [result.insertId]
  );
  return { ...comment, replies: [] };
};

export const removeComment = async (commentId, userId, role) => {
  const isAdmin = role === 'admin';
  const [result] = await pool.query(
    `DELETE FROM post_comments WHERE id = ? ${isAdmin ? '' : 'AND user_id = ?'}`,
    isAdmin ? [commentId] : [commentId, userId]
  );
  if (result.affectedRows === 0) throw Object.assign(new Error('אין הרשאה'), { status: 403 });
};
