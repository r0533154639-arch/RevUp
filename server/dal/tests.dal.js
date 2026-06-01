import pool from '../config/db.js';

export const getTestsByStudent = async (id) => {
  const [rows] = await pool.query('SELECT * FROM tests WHERE student_id = ?', [id]);
  return rows;
};

export const createTest = async ({ studentId, date }) => {
  const [result] = await pool.query(
    'INSERT INTO tests (student_id, date) VALUES (?, ?)',
    [studentId, date]
  );
  return result.insertId;
};

export const createAppeal = async (testId, { reason }) => {
  await pool.query('INSERT INTO appeals (test_id, reason) VALUES (?, ?)', [testId, reason]);
};
