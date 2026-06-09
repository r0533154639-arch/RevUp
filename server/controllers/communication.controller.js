import { saveLessonFeedback, getFeedbackForStudent } from '../dal/communication.dal.js';

export const submitLessonFeedback = async (req, res) => {
  const { lessonId, studentId, rating, notes } = req.body;
  await saveLessonFeedback(lessonId, req.user.id, studentId, rating, notes);
  res.json({ success: true });
};

export const getMyLessonFeedback = async (req, res) => {
  const data = await getFeedbackForStudent(req.user.id);
  res.json(data);
};
