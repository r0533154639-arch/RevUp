import { getLessonsByUser, createLesson, addFeedback } from '../dal/lessons.dal.js';

export const getLessons = async (req, res) => {
  try {
    const data = await getLessonsByUser(req.user.id, req.user.role);
    res.json(data);
  } catch (err) {
    console.error('getLessons error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const scheduleLesson = async (req, res) => {
  try {
    const id = await createLesson({ ...req.body, studentId: req.user.id });
    res.status(201).json({ id });
  } catch (err) {
    console.error('scheduleLesson error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    await addFeedback(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    console.error('submitFeedback error:', err);
    res.status(500).json({ message: err.message });
  }
};
