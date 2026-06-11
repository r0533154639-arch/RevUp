import pool from '../config/db.js';

// תלמיד שולח בקשה למורה
export const createStudentRequest = async (studentId, instructorUserId) => {
  const [[instr]] = await pool.query('SELECT id FROM driving_instructor WHERE user_id = ?', [instructorUserId]);
  if (!instr) throw new Error('Instructor not found');
  await pool.query(
    `INSERT INTO instructor_student_requests (student_id, instructor_id, status)
     VALUES (?, ?, 'pending')
     ON DUPLICATE KEY UPDATE instructor_id = VALUES(instructor_id), status = 'pending', created_at = NOW()`,
    [studentId, instr.id]
  );
};

// קבלת סטטוס בקשה של תלמיד
export const getStudentRequestStatus = async (studentId) => {
  const [rows] = await pool.query(
    `SELECT isr.status, u.name AS instructor_name, di.user_id AS instructor_user_id
     FROM instructor_student_requests isr
     JOIN driving_instructor di ON di.id = isr.instructor_id
     JOIN users u ON u.id = di.user_id
     WHERE isr.student_id = ?`,
    [studentId]
  );
  return rows[0] || null;
};

// בקשות ממתינות למורה
export const getPendingRequestsForInstructor = async (instructorUserId) => {
  const [[instr]] = await pool.query('SELECT id FROM driving_instructor WHERE user_id = ?', [instructorUserId]);
  if (!instr) return [];
  const [rows] = await pool.query(
    `SELECT isr.id, isr.student_id, isr.created_at,
            u.name AS student_name, u.phone AS student_phone, u.email AS student_email,
            vt.name AS vehicle_type
     FROM instructor_student_requests isr
     JOIN users u ON u.id = isr.student_id
     LEFT JOIN driving_students ds ON ds.user_id = isr.student_id
     LEFT JOIN vehicle_types vt ON vt.id = ds.vehicle_type_id
     WHERE isr.instructor_id = ? AND isr.status = 'pending'
     ORDER BY isr.created_at`,
    [instr.id]
  );
  return rows;
};

// ספירת בקשות ממתינות למורה
export const getPendingRequestsCount = async (instructorUserId) => {
  const [[instr]] = await pool.query('SELECT id FROM driving_instructor WHERE user_id = ?', [instructorUserId]);
  if (!instr) return 0;
  const [[{ count }]] = await pool.query(
    `SELECT COUNT(*) AS count FROM instructor_student_requests WHERE instructor_id = ? AND status = 'pending'`,
    [instr.id]
  );
  return count;
};

// אישור בקשה — מעדכן driving_students + סטטוס הבקשה
export const approveStudentRequest = async (requestId, instructorUserId) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[req]] = await conn.query(
      `SELECT isr.student_id, isr.instructor_id
       FROM instructor_student_requests isr
       JOIN driving_instructor di ON di.id = isr.instructor_id
       WHERE isr.id = ? AND di.user_id = ?`,
      [requestId, instructorUserId]
    );
    if (!req) throw new Error('Request not found');
    await conn.query(
      `UPDATE instructor_student_requests SET status = 'approved' WHERE id = ?`,
      [requestId]
    );
    await conn.query(
      `UPDATE driving_students SET instructor_id = ? WHERE user_id = ?`,
      [req.instructor_id, req.student_id]
    );
    await conn.commit();
    return req.student_id;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// דחיית בקשה
export const rejectStudentRequest = async (requestId, instructorUserId) => {
  await pool.query(
    `UPDATE instructor_student_requests isr
     JOIN driving_instructor di ON di.id = isr.instructor_id
     SET isr.status = 'rejected'
     WHERE isr.id = ? AND di.user_id = ?`,
    [requestId, instructorUserId]
  );
};
