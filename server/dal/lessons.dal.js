import pool from '../config/db.js';

export const getLessonsByUser = async (id, role) => {
  if (role === 'admin') {
    const [rows] = await pool.query(
      `SELECT dl.*, u.name AS student_name, ui.name AS instructor_name, ls.name AS status
       FROM driving_lessons dl
       JOIN users u ON u.id = dl.student_id
       JOIN driving_instructor di ON di.id = dl.instructor_id
       JOIN users ui ON ui.id = di.user_id
       JOIN lesson_statuses ls ON ls.id = dl.status_id`
    );
    return rows;
  }
  if (role === 'instructor') {
    const [[instr]] = await pool.query('SELECT id FROM driving_instructor WHERE user_id = ?', [id]);
    if (!instr) return [];
    const [rows] = await pool.query(
      `SELECT dl.*, u.name AS student_name, u.phone AS student_phone, ls.name AS status
       FROM driving_lessons dl
       JOIN users u ON u.id = dl.student_id
       JOIN lesson_statuses ls ON ls.id = dl.status_id
       WHERE dl.instructor_id = ?
       ORDER BY dl.date, dl.time`,
      [instr.id]
    );
    return rows;
  }
  const [rows] = await pool.query(
    `SELECT dl.*, ui.name AS instructor_name, ls.name AS status,
            lf.notes AS feedback_notes, lf.progress_rating
     FROM driving_lessons dl
     JOIN driving_instructor di ON di.id = dl.instructor_id
     JOIN users ui ON ui.id = di.user_id
     JOIN lesson_statuses ls ON ls.id = dl.status_id
     LEFT JOIN lesson_feedback lf ON lf.lesson_id = dl.id
     WHERE dl.student_id = ?
     ORDER BY dl.date, dl.time`,
    [id]
  );
  return rows;
};

export const createLesson = async ({ studentId, instructorId, date, time }) => {
  const [[instr]] = await pool.query('SELECT id FROM driving_instructor WHERE user_id = ?', [instructorId]);
  if (!instr) throw new Error('Instructor not found');
  const [[{ id: pendingStatusId }]] = await pool.query(`SELECT id FROM lesson_statuses WHERE name = 'pending'`);
  const [result] = await pool.query(
    `INSERT INTO driving_lessons (student_id, instructor_id, date, time, status_id) VALUES (?, ?, ?, ?, ?)`,
    [studentId, instr.id, date, time, pendingStatusId]
  );
  return result.insertId;
};

export const addFeedback = async (lessonId, { rating, comment }) => {
  const [[lesson]] = await pool.query('SELECT instructor_id, student_id FROM driving_lessons WHERE id = ?', [lessonId]);
  if (!lesson) throw new Error('Lesson not found');
  await pool.query(
    'INSERT INTO lesson_feedback (lesson_id, instructor_id, student_id, progress_rating, notes) VALUES (?, ?, ?, ?, ?)',
    [lessonId, lesson.instructor_id, lesson.student_id, rating, comment]
  );
};

export const approveLessonById = async (lessonId, instructorUserId) => {
  const [[instr]] = await pool.query('SELECT id FROM driving_instructor WHERE user_id = ?', [instructorUserId]);
  if (!instr) throw new Error('Instructor not found');
  const [[{ id: approvedId }]] = await pool.query(`SELECT id FROM lesson_statuses WHERE name = 'approved'`);
  await pool.query(
    `UPDATE driving_lessons SET status_id = ? WHERE id = ? AND instructor_id = ?`,
    [approvedId, lessonId, instr.id]
  );
};

export const rejectLessonById = async (lessonId, instructorUserId) => {
  const [[instr]] = await pool.query('SELECT id FROM driving_instructor WHERE user_id = ?', [instructorUserId]);
  if (!instr) throw new Error('Instructor not found');
  const [[{ id: cancelledId }]] = await pool.query(`SELECT id FROM lesson_statuses WHERE name = 'cancelled'`);
  await pool.query(
    `UPDATE driving_lessons SET status_id = ?, cancelled_by = 'instructor' WHERE id = ? AND instructor_id = ? AND status_id = (SELECT id FROM lesson_statuses WHERE name = 'pending')`,
    [cancelledId, lessonId, instr.id]
  );
};

export const getLessonWithInstructor = async (lessonId) => {
  const [[row]] = await pool.query(
    `SELECT dl.date, dl.time, us.name AS student_name,
            ui.name AS instructor_name, ui.email AS instructor_email
     FROM driving_lessons dl
     JOIN users us ON us.id = dl.student_id
     JOIN driving_instructor di ON di.id = dl.instructor_id
     JOIN users ui ON ui.id = di.user_id
     WHERE dl.id = ?`,
    [lessonId]
  );
  return row || null;
};

export const getLessonWithStudent = async (lessonId) => {
  const [[row]] = await pool.query(
    `SELECT dl.date, dl.time, u.name AS student_name, u.email AS student_email
     FROM driving_lessons dl
     JOIN users u ON u.id = dl.student_id
     WHERE dl.id = ?`,
    [lessonId]
  );
  return row || null;
};

export const getPendingLessonsCount = async (instructorUserId) => {
  const [[instr]] = await pool.query('SELECT id FROM driving_instructor WHERE user_id = ?', [instructorUserId]);
  if (!instr) return 0;
  const [[{ count }]] = await pool.query(
    `SELECT COUNT(*) AS count FROM driving_lessons dl JOIN lesson_statuses ls ON ls.id = dl.status_id WHERE dl.instructor_id = ? AND ls.name = 'pending'`,
    [instr.id]
  );
  return count;
};

export const getNotifications = async (userId, role) => {
  if (role === 'instructor') {
    const [[instr]] = await pool.query('SELECT id FROM driving_instructor WHERE user_id = ?', [userId]);
    if (!instr) return { pending: [], cancelRequests: [], cancelRejections: [] };
    const [pending] = await pool.query(
      `SELECT dl.id, dl.date, dl.time, u.name AS student_name
       FROM driving_lessons dl JOIN users u ON u.id = dl.student_id
       WHERE dl.instructor_id = ? AND dl.status_id = (SELECT id FROM lesson_statuses WHERE name = 'pending')
       ORDER BY dl.date, dl.time`,
      [instr.id]
    );
    const [cancelRequests] = await pool.query(
      `SELECT dl.id, dl.date, dl.time, u.name AS student_name
       FROM driving_lessons dl JOIN users u ON u.id = dl.student_id
       WHERE dl.instructor_id = ? AND dl.cancel_requested_by = 'student'
       ORDER BY dl.date, dl.time`,
      [instr.id]
    );
    const [cancelRejections] = await pool.query(
      `SELECT dl.id, dl.date, dl.time, u.name AS student_name
       FROM driving_lessons dl JOIN users u ON u.id = dl.student_id
       WHERE dl.instructor_id = ? AND dl.cancel_rejected_by = 'student'
       ORDER BY dl.date, dl.time`,
      [instr.id]
    );
    return { pending, cancelRequests, cancelRejections };
  }
  // student
  const [cancelRequests] = await pool.query(
    `SELECT dl.id, dl.date, dl.time, ui.name AS instructor_name
     FROM driving_lessons dl
     JOIN driving_instructor di ON di.id = dl.instructor_id
     JOIN users ui ON ui.id = di.user_id
     WHERE dl.student_id = ? AND dl.cancel_requested_by = 'instructor'
     ORDER BY dl.date, dl.time`,
    [userId]
  );
  return { pending: [], cancelRequests, cancelRejections: [] };
};
