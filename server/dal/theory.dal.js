import pool from '../config/db.js';

export const getQuestionsPaginated = async (page = 1, limit = 100) => {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    'SELECT * FROM theory_questions ORDER BY id LIMIT ? OFFSET ?',
    [limit, offset]
  );
  const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM theory_questions');
  return { questions: rows, total };
};
