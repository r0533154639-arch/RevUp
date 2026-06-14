import pool from '../config/db.js';
import { getAllStudents, updateStudentStatus, getAllInstructors, getInstructorAchievements, getAllPosts, getAllComments, toggleUserBlock, getAllUsers } from '../dal/admin.dal.js';
import { approveInstructor as approveInstructorDAL, getPendingInstructors } from '../dal/instructors.dal.js';
import { sendLicensedEmail, sendTestFailedEmail } from '../utils/mailer.js';
import { auditAdminAction, auditInstructorApproved } from './auditLog.service.js';

const ALLOWED_EDITS = {
  users:           ['name', 'email', 'phone'],
  driving_students:['status'],
  driving_instructor: ['area'],
  posts:           ['title', 'content'],
  post_comments:   ['content'],
  driving_lessons: ['status', 'date', 'time'],
  lesson_feedback: ['notes', 'progress_rating'],
};

export const getDashboardData = async () => {
  const [[stats]] = await pool.query(
    `SELECT COUNT(*) AS total_users, SUM(role = 'student') AS total_students, SUM(role = 'instructor') AS total_instructors FROM users`
  );
  const [[{ pending_instructors_count }]] = await pool.query(
    `SELECT COUNT(*) AS pending_instructors_count FROM driving_instructor WHERE profile_status = 'pending'`
  );
  const [students] = await pool.query(`
    SELECT u.id, u.name, u.email, u.phone, u.date_of_birth, u.profile_image, u.is_blocked,
           ds.status, vt.name AS vehicle_type, ui.name AS instructor_name
    FROM users u
    JOIN driving_students ds ON ds.user_id = u.id
    LEFT JOIN vehicle_types vt ON vt.id = ds.vehicle_type_id
    LEFT JOIN driving_instructor di ON di.id = ds.instructor_id
    LEFT JOIN users ui ON ui.id = di.user_id
    WHERE u.role = 'student' ORDER BY u.name
  `);
  const [instructors] = await pool.query(`
    SELECT u.id, u.name, u.email, u.phone, u.profile_image, u.is_blocked, di.area, di.profile_status,
           COUNT(DISTINCT ds.user_id) AS student_count,
           ROUND(AVG(ir.rating), 1) AS avg_rating
    FROM users u
    JOIN driving_instructor di ON di.user_id = u.id
    LEFT JOIN driving_students ds ON ds.instructor_id = di.id
    LEFT JOIN instructor_review ir ON ir.instructor_id = di.id
    WHERE u.role = 'instructor' GROUP BY u.id ORDER BY u.name
  `);
  const [posts] = await pool.query(`
    SELECT p.id, p.title, p.content, p.created_at, u.id AS author_id, u.name AS author_name, u.profile_image AS author_image
    FROM posts p JOIN users u ON u.id = p.instructor_id ORDER BY p.created_at DESC
  `);
  const [comments] = await pool.query(`
    SELECT pc.id, pc.content, pc.created_at, pc.post_id, pc.parent_comment_id,
           u.id AS author_id, u.name AS author_name, p.title AS post_title
    FROM post_comments pc JOIN users u ON u.id = pc.user_id JOIN posts p ON p.id = pc.post_id ORDER BY pc.created_at DESC
  `);
  const [lessons] = await pool.query(`
    SELECT dl.id, dl.date, dl.time, ls.name AS status,
           us.name AS student_name, us.id AS student_id, ui.name AS instructor_name, ui.id AS instructor_id,
           vt.name AS vehicle_type, lf.id AS feedback_id, lf.notes AS feedback_notes, lf.progress_rating
    FROM driving_lessons dl
    JOIN users us ON us.id = dl.student_id
    JOIN driving_instructor di ON di.id = dl.instructor_id
    JOIN users ui ON ui.id = di.user_id
    JOIN lesson_statuses ls ON ls.id = dl.status_id
    LEFT JOIN driving_students ds ON ds.user_id = dl.student_id
    LEFT JOIN vehicle_types vt ON vt.id = ds.vehicle_type_id
    LEFT JOIN lesson_feedback lf ON lf.lesson_id = dl.id
    ORDER BY dl.date DESC, dl.time DESC
  `);
  return { ...stats, pending_instructors_count, students, instructors, posts, comments, lessons };
};

export const setUserBlock = (targetId, blocked) => toggleUserBlock(targetId, blocked);

export const editCell = async (table, id, field, value) => {
  if (!ALLOWED_EDITS[table]?.includes(field))
    throw Object.assign(new Error('שדה לא מורשה לעריכה'), { status: 400 });
  const pkCol = table === 'driving_students' ? 'user_id' : 'id';
  await pool.query(`UPDATE ${table} SET ${field} = ? WHERE ${pkCol} = ?`, [value, id]);
  auditAdminAction(null, 'CELL_EDIT', table, id, { field, value }, null);
  if (table === 'driving_students' && field === 'status' && value === 'licensed') {
    const [[user]] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [id]);
    if (user) sendLicensedEmail(user.email, user.name, user.id).catch(console.error);
  }
};

export const changeStudentStatus = async (studentId, status) => {
  if (status === 'test') {
    const [[hasTest]] = await pool.query('SELECT id FROM tests WHERE student_id = ? LIMIT 1', [studentId]);
    if (!hasTest) throw Object.assign(new Error('לא ניתן לשנות לסטטוס טסט ללא טסט קיים'), { status: 400 });
  }
  await updateStudentStatus(studentId, status);
};

export const processTestResult = async (studentId, result) => {
  const statusVal = result === 'passed' ? 'passed' : 'failed';
  await pool.query(`UPDATE tests SET status = ? WHERE student_id = ? ORDER BY id DESC LIMIT 1`, [statusVal, studentId]);
  const [[user]] = await pool.query('SELECT name, email FROM users WHERE id = ?', [studentId]);
  if (result === 'passed') {
    await updateStudentStatus(studentId, 'licensed');
    if (user) sendLicensedEmail(user.email, user.name, studentId).catch(console.error);
  } else {
    await updateStudentStatus(studentId, 'lessons');
    if (user) sendTestFailedEmail(user.email, user.name).catch(console.error);
  }
};

export const approveInstructor = async (userId) => {
  await approveInstructorDAL(userId);
  auditInstructorApproved(null, userId, null);
};

export { getAllStudents, getAllInstructors, getInstructorAchievements, getAllPosts, getAllComments, getAllUsers, getPendingInstructors };
