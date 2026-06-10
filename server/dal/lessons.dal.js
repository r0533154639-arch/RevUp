import pool from '../config/db.js';

export const getLessonsByUser = async (id, role) => {
  if (role === 'admin') {
    const [rows] = await pool.query(
      `SELECT dl.*, u.name AS student_name, ui.name AS instructor_name
       FROM driving_lessons dl
       JOIN users u ON u.id = dl.student_id
       JOIN driving_instructor di ON di.id = dl.instructor_id
       JOIN users ui ON ui.id = di.user_id`
    );
    return rows;
  }
  if (role === 'instructor') {
    const [[instr]] = await pool.query('SELECT id FROM driving_instructor WHERE user_id = ?', [id]);
    if (!instr) return [];
    const [rows] = await pool.query(
      `SELECT dl.*, u.name AS student_name, u.phone AS student_phone
       FROM driving_lessons dl
       JOIN users u ON u.id = dl.student_id
       WHERE dl.instructor_id = ?
       ORDER BY dl.date, dl.time`,
      [instr.id]
    );
    return rows;
  }
  const [rows] = await pool.query(
    `SELECT dl.*, ui.name AS instructor_name
     FROM driving_lessons dl
     JOIN driving_instructor di ON di.id = dl.instructor_id
     JOIN users ui ON ui.id = di.user_id
     WHERE dl.student_id = ?
     ORDER BY dl.date, dl.time`,
    [id]
  );
  return rows;
};

export const createLesson = async ({ studentId, instructorId, date, time }) => {
  // instructorId כאן הוא user_id של המורה — נמצא את ה-driving_instructor.id
  const [[instr]] = await pool.query('SELECT id FROM driving_instructor WHERE user_id = ?', [instructorId]);
  if (!instr) throw new Error('Instructor not found');
  const [result] = await pool.query(
    `INSERT INTO driving_lessons (student_id, instructor_id, date, time, status_id)
     VALUES (?, ?, ?, ?, (SELECT id FROM lesson_statuses WHERE name = 'pending'))`,
    [studentId, instr.id, date, time]
  );
  return result.insertId;
};

export const addFeedback = async (lessonId, { rating, comment }) => {
  await pool.query('INSERT INTO feedback (lesson_id, rating, comment) VALUES (?, ?, ?)', [lessonId, rating, comment]);
};
