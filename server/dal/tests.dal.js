import pool from '../db.js';

export const getTestsByStudent = async (id) => {
  const [rows] = await pool.query('SELECT * FROM Tests WHERE student_id = ?', [id]);
  return rows;
};

export const createTest = async ({ studentId, date, location }) => {
  const [result] = await pool.query(
    'INSERT INTO Tests (student_id, date, location) VALUES (?, ?, ?)',
    [studentId, date, location]
  );
  return result.insertId;
};

export const createAppeal = async (testId, { reason }) => {
  await pool.query('INSERT INTO Appeals (test_id, reason) VALUES (?, ?)', [testId, reason]);
};
