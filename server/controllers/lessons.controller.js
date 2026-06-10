import { getLessonsByUser, createLesson, addFeedback, approveLessonById, getPendingLessonsCount, getNotifications } from '../dal/lessons.dal.js';

export const getLessons = async (req, res) => {
  try {
    const data = await getLessonsByUser(req.user.id, req.user.role);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const scheduleLesson = async (req, res) => {
  try {
    const id = await createLesson({ ...req.body, studentId: req.user.id });
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    await addFeedback(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approveLesson = async (req, res) => {
  try {
    await approveLessonById(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPendingCount = async (req, res) => {
  try {
    const count = await getPendingLessonsCount(req.user.id);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyNotifications = async (req, res) => {
  try {
    const data = await getNotifications(req.user.id, req.user.role);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
