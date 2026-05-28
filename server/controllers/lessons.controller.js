import { getLessonsByUser, createLesson, addFeedback } from '../dal/lessons.dal.js';

export const getLessons = async (req, res) => {
  const data = await getLessonsByUser(req.user.id, req.user.role);
  res.json(data);
};

export const scheduleLesson = async (req, res) => {
  const id = await createLesson({ ...req.body, studentId: req.user.id });
  res.status(201).json({ id });
};

export const submitFeedback = async (req, res) => {
  await addFeedback(req.params.id, req.body);
  res.json({ success: true });
};
