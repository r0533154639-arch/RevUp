import pool from '../config/db.js';

export const getAllInstructors = async ({ area } = {}) => {
  const where = area?.trim()
    ? 'WHERE di.area LIKE ? AND di.profile_status = \'active\''
    : 'WHERE di.profile_status = \'active\'';
  const [rows] = await pool.query(
    `SELECT di.id, di.area, u.id AS user_id, u.name, u.phone, COALESCE(u.profile_image, NULL) as profile_image
     FROM driving_instructor di
     JOIN users u ON u.id = di.user_id
     ${where}`,
    area?.trim() ? [`%${area.trim()}%`] : []
  );
  return rows;
};

export const completeInstructorProfile = async (userId, { area, vehicle_types, years_experience }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'UPDATE driving_instructor SET area = ?, years_experience = ?, profile_status = ? WHERE user_id = ?',
      [area, years_experience || null, 'pending', userId]
    );
    const [[instr]] = await conn.query('SELECT id FROM driving_instructor WHERE user_id = ?', [userId]);
    if (vehicle_types?.length) {
      await conn.query('DELETE FROM instructor_vehicle_types WHERE instructor_id = ?', [instr.id]);
      const values = vehicle_types.map(vtId => [instr.id, vtId]);
      await conn.query('INSERT INTO instructor_vehicle_types (instructor_id, vehicle_type_id) VALUES ?', [values]);
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const getInstructorProfileStatus = async (userId) => {
  const [[row]] = await pool.query(
    'SELECT profile_status FROM driving_instructor WHERE user_id = ?',
    [userId]
  );
  return row?.profile_status || null;
};

export const approveInstructor = async (userId) => {
  await pool.query(
    'UPDATE driving_instructor SET profile_status = ? WHERE user_id = ?',
    ['active', userId]
  );
};

export const getPendingInstructors = async () => {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, di.area, di.years_experience, di.profile_status
     FROM driving_instructor di
     JOIN users u ON u.id = di.user_id
     WHERE di.profile_status = 'pending'
     ORDER BY u.name`
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
