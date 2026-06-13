import { getLessonsByUser, createLesson, addFeedback, approveLessonById, rejectLessonById, getPendingLessonsCount, getNotifications, getLessonWithStudent, getLessonWithInstructor } from '../dal/lessons.dal.js';
import { sendLessonApprovedEmail, sendLessonScheduledEmail } from '../services/mailer.js';
import pool from '../config/db.js';
import { asyncHandler } from '../utils/controllerFactory.js';

export const getLessons = asyncHandler(async (req, res) => {
  const data = await getLessonsByUser(req.user.id, req.user.role);
  res.json(data);
});

export const scheduleLesson = asyncHandler(async (req, res) => {
  const id = await createLesson({ ...req.body, studentId: req.user.id });
  const lesson = await getLessonWithInstructor(id);
  if (lesson) sendLessonScheduledEmail(lesson.instructor_email, lesson.instructor_name, lesson.student_name, lesson.date, lesson.time).catch(console.error);
  res.status(201).json({ id });
});

export const submitFeedback = asyncHandler(async (req, res) => {
  await addFeedback(req.params.id, req.body);
  res.json({ success: true });
});

export const approveLesson = asyncHandler(async (req, res) => {
  await approveLessonById(req.params.id, req.user.id);
  const lesson = await getLessonWithStudent(req.params.id);
  if (lesson) sendLessonApprovedEmail(lesson.student_email, lesson.student_name, lesson.date, lesson.time).catch(console.error);
  res.json({ success: true });
});

export const rejectLesson = asyncHandler(async (req, res) => {
  await rejectLessonById(req.params.id, req.user.id);
  res.json({ success: true });
});

export const dismissLesson = asyncHandler(async (req, res) => {
  await pool.query(
    `DELETE FROM driving_lessons WHERE id = ? AND student_id = ? AND status = 'cancelled' AND cancelled_by = 'instructor'`,
    [req.params.id, req.user.id]
  );
  res.json({ success: true });
});

export const getPendingCount = asyncHandler(async (req, res) => {
  const count = await getPendingLessonsCount(req.user.id);
  res.json({ count });
});

export const getMyNotifications = asyncHandler(async (req, res) => {
  const data = await getNotifications(req.user.id, req.user.role);
  res.json(data);
});
