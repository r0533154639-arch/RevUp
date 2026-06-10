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
