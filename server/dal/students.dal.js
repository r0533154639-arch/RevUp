import pool from '../config/db.js';

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT u.*, p.password_hash AS password FROM Users u JOIN passwords p ON p.user_id = u.id WHERE u.email = ?',
    [email]
  );
  return rows[0];
};

export const createUser = async ({ name, email, phone, password, role }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO Users (name, email, phone, role) VALUES (?, ?, ?, ?)',
      [name, email, phone, role]
    );
    const userId = result.insertId;
    await conn.query(
      'INSERT INTO passwords (user_id, password_hash) VALUES (?, ?)',
      [userId, password]
    );
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
  const [rows] = await pool.query('SELECT * FROM StudentProgress WHERE student_id = ?', [id]);
  return rows[0];
};

export const setStudentStatus = async (id, status) => {
  await pool.query('UPDATE Students SET status = ? WHERE user_id = ?', [status, id]);
};
