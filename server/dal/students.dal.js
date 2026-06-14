import pool from '../config/db.js';

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.date_of_birth, u.profile_image, u.is_blocked,
            u.role, p.password_hash AS password,
            ds.instructor_id, ds.status,
            di.user_id AS instructor_user_id
     FROM users u
     JOIN passwords p ON p.user_id = u.id
     LEFT JOIN driving_students ds ON ds.user_id = u.id
     LEFT JOIN driving_instructor di ON di.id = ds.instructor_id
     WHERE u.email = ?`,
    [email]
  );
  return rows[0];
};

export const findUserById = async (id) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.date_of_birth, u.profile_image, u.is_blocked,
            u.role, p.password_hash AS password,
            ds.instructor_id, ds.status,
            di.user_id AS instructor_user_id
     FROM users u
     JOIN passwords p ON p.user_id = u.id
     LEFT JOIN driving_students ds ON ds.user_id = u.id
     LEFT JOIN driving_instructor di ON di.id = ds.instructor_id
     WHERE u.id = ?`,
    [id]
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
      const [instrResult] = await conn.query(
        'INSERT INTO driving_instructor (user_id, profile_status) VALUES (?, ?)',
        [userId, 'draft']
      );
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

export const updateProfileImage = async (userId, filename) => {
  await pool.query('UPDATE users SET profile_image = ? WHERE id = ?', [filename, userId]);
};

// TODO: להסיר כשיהיה תהליך בחירת מורה אמיתי
export const chooseInstructor = async (studentId, instructorId) => {
  await pool.query(
    'UPDATE driving_students SET instructor_id = ? WHERE user_id = ?',
    [instructorId, studentId]
  );
};

export const getStudentInstructor = async (studentId) => {
  const [rows] = await pool.query(
    'SELECT instructor_id FROM driving_students WHERE user_id = ?',
    [studentId]
  );
  return rows[0];
};

export const getStudentsByInstructor = async (instructorId, role) => {
  if (role === 'admin') {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.date_of_birth,
              ds.status, vt.name AS vehicle_type,
              ui.name AS instructor_name,
              (SELECT dl.id FROM driving_lessons dl
               WHERE dl.student_id = u.id
               ORDER BY dl.date DESC LIMIT 1) AS last_lesson_id
       FROM driving_students ds
       JOIN users u ON u.id = ds.user_id
       LEFT JOIN vehicle_types vt ON vt.id = ds.vehicle_type_id
       LEFT JOIN driving_instructor di ON di.id = ds.instructor_id
       LEFT JOIN users ui ON ui.id = di.user_id`
    );
    return rows;
  }
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

export const getInstructorAchievements = async (instructorId, role) => {
  const where = role === 'admin' ? '' : 'WHERE di.user_id = ?';
  const params = role === 'admin' ? [] : [instructorId];
  const [[stats]] = await pool.query(
    `SELECT
       COUNT(DISTINCT CASE WHEN ds.status != 'licensed' THEN ds.user_id END) AS total_students,
       COUNT(DISTINCT CASE WHEN ds.status = 'licensed' THEN ds.user_id END)  AS tests_passed,
       COUNT(dl.id)                                                           AS total_lessons,
       COALESCE(SUM(dl.status = 'completed'), 0)                             AS completed_lessons,
       ROUND(SUM(dl.status = 'completed') / NULLIF(COUNT(dl.id),0)*100)      AS completion_rate,
       ROUND(AVG(ir.rating),1)                                               AS avg_rating,
       COUNT(DISTINCT ir.id)                                                 AS total_reviews
     FROM driving_instructor di
     LEFT JOIN driving_students ds  ON ds.instructor_id = di.id
     LEFT JOIN driving_lessons dl   ON dl.instructor_id = di.id
     LEFT JOIN instructor_review ir ON ir.instructor_id = di.id
     ${where}`,
    params
  );
  return stats ?? { total_students: 0, tests_passed: 0, total_lessons: 0, completed_lessons: 0, completion_rate: null, avg_rating: null, total_reviews: 0 };
};
