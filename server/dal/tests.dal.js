import pool from '../config/db.js';

export const getTestsByStudent = async (id) => {
  const [rows] = await pool.query('SELECT * FROM tests WHERE student_id = ?', [id]);
  return rows;
};

export const createTest = async ({ studentId, date }) => {
  const [result] = await pool.query(
    'INSERT INTO tests (student_id, date) VALUES (?, ?)',
    [studentId, date]
  );
  return result.insertId;
};

export const createAppeal = async (testId, { reason }) => {
  await pool.query('INSERT INTO appeals (test_id, reason) VALUES (?, ?)', [testId, reason]);
};

export const getCompletedLessonsCount = async (studentId) => {
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS count FROM driving_lessons dl JOIN lesson_statuses ls ON ls.id = dl.status_id WHERE dl.student_id = ? AND ls.name = 'completed'`,
    [studentId]
  );
  return row.count;
};

export const getTestRequest = async (studentId) => {
  const [[row]] = await pool.query(
    'SELECT * FROM test_requests WHERE student_id = ?',
    [studentId]
  );
  return row || null;
};

export const createTestRequest = async (studentId, instructorId) => {
  await pool.query(
    `INSERT INTO test_requests (student_id, instructor_id) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE status = 'pending', created_at = NOW()`,
    [studentId, instructorId]
  );
};

export const scheduleTestByInstructor = async (testRequestId, { date, time }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    // Get student_id from test_request
    const [[request]] = await conn.query(
      'SELECT student_id FROM test_requests WHERE id = ?',
      [testRequestId]
    );
    if (!request) throw new Error('Test request not found');
    
    // Create test
    const [result] = await conn.query(
      'INSERT INTO tests (student_id, date, time) VALUES (?, ?, ?)',
      [request.student_id, date, time]
    );
    
    // Update test request status
    await conn.query(
      'UPDATE test_requests SET status = "scheduled" WHERE id = ?',
      [testRequestId]
    );
    
    await conn.commit();
    return result.insertId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const getLatestTest = async (studentId) => {
  const [[row]] = await pool.query(
    `SELECT id, date, time, status FROM tests WHERE student_id = ? ORDER BY date DESC LIMIT 1`,
    [studentId]
  );
  return row || null;
};

// For instructor - get pending test requests
export const getTestRequestsForInstructor = async (instructorId) => {
  const [rows] = await pool.query(
    `SELECT tr.id, tr.student_id, tr.status, tr.created_at, u.name AS student_name
     FROM test_requests tr
     JOIN users u ON u.id = tr.student_id
     WHERE tr.instructor_id = ? AND tr.status = 'pending'
     ORDER BY tr.created_at DESC`,
    [instructorId]
  );
  return rows;
};
