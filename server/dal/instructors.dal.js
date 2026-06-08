import pool from '../config/db.js';

export const getAllInstructors = async ({ area } = {}) => {
  const where = area ? 'WHERE di.area LIKE ?' : '';
  const [rows] = await pool.query(
    `SELECT di.id, di.area, di.photo, u.name, u.phone
     FROM driving_instructor di
     JOIN users u ON u.id = di.user_id
     ${where}`,
    area ? [`%${area}%`] : []
  );
  return rows;
};

export const getInstructorSchedule = async (id) => {
  const [rows] = await pool.query('SELECT * FROM driving_lessons WHERE instructor_id = ?', [id]);
  return rows;
};

export const approveLessonById = async (id) => {
  await pool.query('UPDATE driving_lessons SET status = "approved" WHERE id = ?', [id]);
};

export const saveInstructorPhoto = async (userId, photo) => {
  await pool.query('UPDATE driving_instructor SET photo = ? WHERE user_id = ?', [photo, userId]);
};
