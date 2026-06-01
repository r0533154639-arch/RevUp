import pool from '../config/db.js';

export const getPosts = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Posts ORDER BY created_at DESC');
  res.json(rows);
};

export const createPost = async (req, res) => {
  const { title, content } = req.body;
  const [result] = await pool.query('INSERT INTO Posts (title, content, user_id) VALUES (?, ?, ?)', [title, content, req.user.id]);
  res.status(201).json({ id: result.insertId });
};
