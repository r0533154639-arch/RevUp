import pool from '../config/db.js';

export const getPosts = async (req, res) => {
  const [rows] = await pool.query(
    'SELECT p.*, u.name AS instructor_name FROM posts p JOIN users u ON u.id = p.instructor_id ORDER BY p.created_at DESC'
  );
  res.json(rows);
};

export const createPost = async (req, res) => {
  const { title, content } = req.body;
  const [result] = await pool.query(
    'INSERT INTO posts (title, content, instructor_id) VALUES (?, ?, ?)',
    [title, content, req.user.id]
  );
  res.status(201).json({ id: result.insertId });
};

export const updatePost = async (req, res) => {
  const { title, content } = req.body;
  const { id } = req.params;
  const [result] = await pool.query(
    'UPDATE posts SET title = ?, content = ? WHERE id = ? AND instructor_id = ?',
    [title, content, id, req.user.id]
  );
  if (result.affectedRows === 0) return res.status(403).json({ message: 'אין הרשאה' });
  res.json({ success: true });
};
