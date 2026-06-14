import pool from '../config/db.js';
import { getLessonsByUser, createLesson, approveLessonById, rejectLessonById, getPendingLessonsCount, getNotifications, getLessonWithStudent, getLessonWithInstructor } from '../dal/lessons.dal.js';
import { sendLessonApprovedEmail, sendLessonScheduledEmail } from '../utils/mailer.js';
import { auditLessonCreated, auditLessonApproved, auditLessonRejected, auditLessonCancelled } from './auditLog.service.js';

export const fetchLessons = (userId, role) => getLessonsByUser(userId, role);

export const bookLesson = async (studentId, { instructorId, date, time }) => {
  const id = await createLesson({ studentId, instructorId, date, time });
  const lesson = await getLessonWithInstructor(id);
  if (lesson)
    sendLessonScheduledEmail(lesson.instructor_email, lesson.instructor_name, lesson.student_name, lesson.date, lesson.time).catch(console.error);
  auditLessonCreated(studentId, id, { instructorId, date, time }, null);
  return id;
};

export const approveLesson = async (lessonId, instructorUserId) => {
  await approveLessonById(lessonId, instructorUserId);
  const lesson = await getLessonWithStudent(lessonId);
  if (lesson)
    sendLessonApprovedEmail(lesson.student_email, lesson.student_name, lesson.date, lesson.time).catch(console.error);
  auditLessonApproved(instructorUserId, lessonId, null);
};

export const rejectLesson = async (lessonId, instructorUserId) => {
  await rejectLessonById(lessonId, instructorUserId);
  auditLessonRejected(instructorUserId, lessonId, null);
};

export const dismissCancelledLesson = async (lessonId, studentId) => {
  await pool.query(
    `DELETE FROM driving_lessons WHERE id = ? AND student_id = ? AND cancelled_by = 'instructor'`,
    [lessonId, studentId]
  );
};

export const cancelLesson = async (lessonId, userId, role) => {
  const [[lesson]] = await pool.query(
    `SELECT dl.*, di.user_id AS instructor_user_id,
            DATEDIFF(dl.date, CURDATE()) AS days_until
     FROM driving_lessons dl
     JOIN driving_instructor di ON di.id = dl.instructor_id
     WHERE dl.id = ?`,
    [lessonId]
  );
  if (!lesson) throw Object.assign(new Error('שיעור לא נמצא'), { status: 404 });

  const isStudent    = role === 'student'    && lesson.student_id === userId;
  const isInstructor = role === 'instructor' && lesson.instructor_user_id === userId;
  if (!isStudent && !isInstructor && role !== 'admin')
    throw Object.assign(new Error('אין הרשאה'), { status: 403 });

  // יותר מ-48 שעות — ביטול ישיר
  if (lesson.days_until >= 2 || role === 'admin') {
    await pool.query(`DELETE FROM driving_lessons WHERE id = ?`, [lessonId]);
    auditLessonCancelled(userId, lessonId, role, null);
    return { cancelled: true };
  }

  // פחות מ-48 שעות — בקשת ביטול משותפת
  if (lesson.cancel_requested_by && lesson.cancel_requested_by !== role) {
    await pool.query(`DELETE FROM driving_lessons WHERE id = ?`, [lessonId]);
    auditLessonCancelled(userId, lessonId, role, null);
    return { cancelled: true };
  }

  await pool.query(`UPDATE driving_lessons SET cancel_requested_by = ? WHERE id = ?`, [role, lessonId]);
  return { cancelled: false, message: 'בקשת הביטול נשלחה. השיעור יתבטל רק לאחר אישור הצד השני.' };
};

export const rejectCancelRequest = async (lessonId, userId, role) => {
  const [[lesson]] = await pool.query(
    `SELECT dl.*, di.user_id AS instructor_user_id FROM driving_lessons dl
     JOIN driving_instructor di ON di.id = dl.instructor_id WHERE dl.id = ?`,
    [lessonId]
  );
  if (!lesson) throw Object.assign(new Error('שיעור לא נמצא'), { status: 404 });

  const isStudent    = role === 'student'    && lesson.student_id === userId;
  const isInstructor = role === 'instructor' && lesson.instructor_user_id === userId;
  if (!isStudent && !isInstructor)
    throw Object.assign(new Error('אין הרשאה'), { status: 403 });

  await pool.query(
    `UPDATE driving_lessons SET cancel_requested_by = NULL, cancel_rejected_by = ? WHERE id = ?`,
    [role, lessonId]
  );
};

export const fetchPendingCount   = (userId)        => getPendingLessonsCount(userId);
export const fetchNotifications  = (userId, role)  => getNotifications(userId, role);
