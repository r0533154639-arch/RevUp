import pool from '../db.js';

export const getAllInstructors = async ({ area } = {}) => {
  const [rows] = await pool.query(
    `SELECT * FROM Instructors${area ? ' WHERE area = ?' : ''}`,
    area ? [area] : []
  );
  return rows;
};

export const getInstructorSchedule = async (id) => {
  const [rows] = await pool.query('SELECT * FROM Lessons WHERE instructor_id = ?', [id]);
  return rows;
};

export const approveLessonById = async (id) => {
  await pool.query('UPDATE Lessons SET status = "approved" WHERE id = ?', [id]);
};
