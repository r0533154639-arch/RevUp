import pool from '../config/db.js';

export const getAllInstructors = async ({ area } = {}) => {
  const [rows] = await pool.query(
    `SELECT * FROM DrivingInstructors${area ? ' WHERE area = ?' : ''}`,
    area ? [area] : []
  );
  return rows;
};

export const getInstructorSchedule = async (id) => {
  const [rows] = await pool.query('SELECT * FROM DrivingLessons WHERE instructor_id = ?', [id]);
  return rows;
};

export const approveLessonById = async (id) => {
  await pool.query('UPDATE DrivingLessons SET status = "approved" WHERE id = ?', [id]);
};
