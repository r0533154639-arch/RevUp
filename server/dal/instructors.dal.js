import pool from '../config/db.js';

export const getAllInstructors = async ({ area } = {}) => {
  const where = area?.trim() ? 'WHERE di.area LIKE ?' : '';
  const [rows] = await pool.query(
    `SELECT di.id, di.area, u.name, u.phone, COALESCE(u.profile_image, NULL) as profile_image
     FROM driving_instructor di
     JOIN users u ON u.id = di.user_id
     ${where}`,
    area?.trim() ? [`%${area.trim()}%`] : []
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

export const updateProfileImage = async (userId, filename) => {
  await pool.query('UPDATE users SET profile_image = ? WHERE id = ?', [filename, userId]);
};
