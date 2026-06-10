import { saveLessonFeedback, getFeedbackForStudent, saveContactMessage, getAllContactMessages } from '../dal/communication.dal.js';

export const submitLessonFeedback = async (req, res) => {
  const { lessonId, studentId, rating, notes } = req.body;
  await saveLessonFeedback(lessonId, req.user.id, studentId, rating, notes);
  res.json({ success: true });
};

export const getMyLessonFeedback = async (req, res) => {
  const data = await getFeedbackForStudent(req.user.id);
  res.json(data);
};

export const submitContact = async (req, res) => {
  const { subject, message } = req.body;
  if (!subject?.trim() || !message?.trim()) return res.status(400).json({ message: 'חסרים שדות' });
  await saveContactMessage(req.user.id, subject, message);
  res.json({ success: true });
};

export const getContacts = async (req, res) => {
  const data = await getAllContactMessages();
  res.json(data);
};
