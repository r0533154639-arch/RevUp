import pool from '../config/db.js';

export const saveLessonFeedback = async (lessonId, instructorUserId, studentId, rating, notes) => {
  const [[instr]] = await pool.query('SELECT id FROM driving_instructor WHERE user_id = ?', [instructorUserId]);
  if (!instr) throw new Error('Instructor not found');
  await pool.query(
    `INSERT INTO lesson_feedback (lesson_id, instructor_id, student_id, progress_rating, notes)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE progress_rating = ?, notes = ?`,
    [lessonId, instr.id, studentId, rating, notes, rating, notes]
  );
};

export const getFeedbackForLesson = async (lessonId) => {
  const [[row]] = await pool.query(
    `SELECT progress_rating, notes FROM lesson_feedback WHERE lesson_id = ?`,
    [lessonId]
  );
  return row || null;
};

export const getFeedbackForStudent = async (studentId) => {
  const [rows] = await pool.query(
    `SELECT lf.progress_rating, lf.notes, lf.created_at,
            dl.date AS lesson_date
     FROM lesson_feedback lf
     JOIN driving_lessons dl ON dl.id = lf.lesson_id
     WHERE lf.student_id = ?
     ORDER BY dl.date DESC`,
    [studentId]
  );
  return rows;
};

export const saveContactMessage = async (userId, subject, message) => {
  await pool.query(
    `INSERT INTO contact_messages (user_id, subject, message) VALUES (?, ?, ?)`,
    [userId, subject, message]
  );
};

export const getAllContactMessages = async () => {
  const [rows] = await pool.query(
    `SELECT cm.id, cm.subject, cm.message, cm.created_at,
            u.name AS user_name, u.email AS user_email
     FROM contact_messages cm
     JOIN users u ON u.id = cm.user_id
     ORDER BY cm.created_at DESC`
  );
  return rows;
};

// משובים כלליים ממורה לתלמיד
export const saveGeneralFeedback = async (instructorUserId, studentId, rating, notes) => {
  const [[instr]] = await pool.query('SELECT id FROM driving_instructor WHERE user_id = ?', [instructorUserId]);
  if (!instr) throw new Error('Instructor not found');
  await pool.query(
    `INSERT INTO general_feedback (instructor_id, student_id, rating, notes) VALUES (?, ?, ?, ?)`,
    [instr.id, studentId, rating, notes]
  );
};

export const getGeneralFeedbackForStudent = async (studentId) => {
  const [rows] = await pool.query(
    `SELECT gf.id, gf.rating, gf.notes, gf.created_at,
            u.name AS instructor_name
     FROM general_feedback gf
     JOIN driving_instructor di ON di.id = gf.instructor_id
     JOIN users u ON u.id = di.user_id
     WHERE gf.student_id = ?
     ORDER BY gf.created_at DESC`,
    [studentId]
  );
  return rows;
};
