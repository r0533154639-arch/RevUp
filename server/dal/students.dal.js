import pool from '../db.js';

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
  return rows[0];
};

export const createUser = async ({ name, email, password, role }) => {
  const [result] = await pool.query('INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, password, role]);
  return result.insertId;
};

export const getStudentProgress = async (id) => {
  const [rows] = await pool.query('SELECT * FROM StudentProgress WHERE student_id = ?', [id]);
  return rows[0];
};

export const setStudentStatus = async (id, status) => {
  await pool.query('UPDATE Students SET status = ? WHERE user_id = ?', [status, id]);
};
