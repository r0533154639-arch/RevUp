import { saveLessonFeedback, getFeedbackForStudent, getFeedbackForLesson, saveContactMessage, getAllContactMessages, saveGeneralFeedback, getGeneralFeedbackForStudent } from '../dal/communication.dal.js';
import { findUserById } from '../dal/students.dal.js';
import { sendGeneralFeedbackEmail } from '../services/mailer.js';

export const submitLessonFeedback = async (req, res) => {
  try {
    const { lessonId, studentId, rating, notes } = req.body;
    await saveLessonFeedback(lessonId, req.user.id, studentId, rating, notes);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyLessonFeedback = async (req, res) => {
  try {
    const data = await getFeedbackForStudent(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLessonFeedback = async (req, res) => {
  try {
    const data = await getFeedbackForLesson(req.params.lessonId);
    res.json(data || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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

// משוב כללי ממורה לתלמיד
export const submitGeneralFeedback = async (req, res) => {
  try {
    const { studentId, rating, notes } = req.body;
    await saveGeneralFeedback(req.user.id, studentId, rating, notes);
    // שליחת מייל לתלמיד
    const student = await findUserById(studentId);
    if (student) sendGeneralFeedbackEmail(student.email, student.name, notes, rating).catch(console.error);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyGeneralFeedback = async (req, res) => {
  try {
    const data = await getGeneralFeedbackForStudent(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
