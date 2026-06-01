import pool from '../config/db.js';

export const getLessonsByUser = async (id, role) => {
  const col = role === 'instructor' ? 'instructor_id' : 'student_id';
  const [rows] = await pool.query(`SELECT * FROM DrivingLessons WHERE ${col} = ?`, [id]);
  return rows;
};

export const createLesson = async ({ studentId, instructorId, date, time }) => {
  const [result] = await pool.query(
    'INSERT INTO DrivingLessons (student_id, instructor_id, date, time) VALUES (?, ?, ?, ?)',
    [studentId, instructorId, date, time]
  );
  return result.insertId;
};

export const addFeedback = async (lessonId, { rating, comment }) => {
  await pool.query('INSERT INTO Feedback (lesson_id, rating, comment) VALUES (?, ?, ?)', [lessonId, rating, comment]);
};
