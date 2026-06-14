import { saveLessonFeedback, getFeedbackForStudent, getFeedbackForLesson, saveContactMessage, getAllContactMessages, saveGeneralFeedback, getGeneralFeedbackForStudent } from '../dal/communication.dal.js';
import { findUserById } from '../dal/students.dal.js';
import { sendGeneralFeedbackEmail } from '../utils/mailer.js';
import { asyncHandler } from '../utils/controllerFactory.js';

export const submitLessonFeedback = asyncHandler(async (req, res) => {
  const { lessonId, studentId, rating, notes } = req.body;
  await saveLessonFeedback(lessonId, req.user.id, studentId, rating, notes);
  res.json({ success: true });
});

export const getMyLessonFeedback = asyncHandler(async (req, res) => {
  const data = await getFeedbackForStudent(req.user.id);
  res.json(data);
});

export const getLessonFeedback = asyncHandler(async (req, res) => {
  const data = await getFeedbackForLesson(req.params.lessonId);
  res.json(data || null);
});

export const submitContact = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  if (!subject?.trim() || !message?.trim()) {
    return res.status(400).json({ message: 'חסרים שדות' });
  }
  await saveContactMessage(req.user.id, subject, message);
  res.json({ success: true });
});

export const getContacts = asyncHandler(async (req, res) => {
  const data = await getAllContactMessages();
  res.json(data);
});

export const submitGeneralFeedback = asyncHandler(async (req, res) => {
  const { studentId, rating, notes } = req.body;
  await saveGeneralFeedback(req.user.id, studentId, rating, notes);
  const student = await findUserById(studentId);
  if (student) sendGeneralFeedbackEmail(student.email, student.name, notes, rating).catch(console.error);
  res.json({ success: true });
});

export const getMyGeneralFeedback = asyncHandler(async (req, res) => {
  const data = await getGeneralFeedbackForStudent(req.user.id);
  res.json(data);
});
