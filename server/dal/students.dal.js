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
  const [rows] = await pool.query('SELECT * FROM student_progress_view WHERE student_id = ?', [id]);
  return rows[0];
};

export const setStudentStatus = async (id, status) => {
  await pool.query('UPDATE driving_students SET status = ? WHERE user_id = ?', [status, id]);
};

// TODO: להסיר כשיהיה תהליך בחירת מורה אמיתי
export const chooseInstructor = async (studentId, instructorId) => {
  await pool.query(
    'UPDATE driving_students SET instructor_id = ? WHERE user_id = ?',
    [instructorId, studentId]
  );
};

export const getStudentsByInstructor = async (instructorId) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.date_of_birth,
            ds.status, vt.name AS vehicle_type,
            (SELECT dl.id FROM driving_lessons dl
             WHERE dl.student_id = u.id AND dl.instructor_id = di.id
             ORDER BY dl.date DESC LIMIT 1) AS last_lesson_id
     FROM driving_students ds
     JOIN users u ON u.id = ds.user_id
     LEFT JOIN vehicle_types vt ON vt.id = ds.vehicle_type_id
     JOIN driving_instructor di ON di.id = ds.instructor_id
     WHERE di.user_id = ?`,
    [instructorId]
  );
  return rows;
};
