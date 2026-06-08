import pool from '../config/db.js';

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT u.*, p.password_hash AS password FROM users u JOIN passwords p ON p.user_id = u.id WHERE u.email = ?',
    [email]
  );
  return rows[0];
};

export const createUser = async ({ name, email, phone, password, role, date_of_birth, status, area, vehicle_types, vehicle_type_id }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO users (name, email, phone, role, date_of_birth) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, role, date_of_birth]
    );
    const userId = result.insertId;
    await conn.query('INSERT INTO passwords (user_id, password_hash) VALUES (?, ?)', [userId, password]);

    if (role === 'student') {
      await conn.query('INSERT INTO driving_students (user_id, status, vehicle_type_id) VALUES (?, ?, ?)', [userId, status || 'theory', vehicle_type_id]);
    } else if (role === 'instructor') {
      const [instrResult] = await conn.query('INSERT INTO driving_instructor (user_id, area) VALUES (?, ?)', [userId, area]);
      const instructorId = instrResult.insertId;
      if (vehicle_types?.length) {
        const values = vehicle_types.map(vtId => [instructorId, vtId]);
        await conn.query('INSERT INTO instructor_vehicle_types (instructor_id, vehicle_type_id) VALUES ?', [values]);
      }
    }

    await conn.commit();
    return userId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const getStudentProgress = async (id) => {
  const [rows] = await pool.query('SELECT * FROM student_progress WHERE student_id = ?', [id]);
  return rows[0];
};

export const setStudentStatus = async (id, status) => {
  await pool.query('UPDATE driving_students SET status = ? WHERE user_id = ?', [status, id]);
};

export const findUserById = async (id) => {
  const [rows] = await pool.query(
    'SELECT u.*, p.password_hash AS password FROM users u JOIN passwords p ON p.user_id = u.id WHERE u.id = ?',
    [id]
  );
  return rows[0];
};

export const updateProfileImage = async (userId, filename) => {
  await pool.query('UPDATE users SET profile_image = ? WHERE id = ?', [filename, userId]);
};
