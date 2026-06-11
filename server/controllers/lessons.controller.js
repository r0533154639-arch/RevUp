import { getLessonsByUser, createLesson, addFeedback, approveLessonById, getPendingLessonsCount, getNotifications, getLessonWithStudent, getLessonWithInstructor } from '../dal/lessons.dal.js';
import { sendLessonApprovedEmail, sendLessonScheduledEmail } from '../services/mailer.js';

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
    const lesson = await getLessonWithInstructor(id);
    if (lesson) sendLessonScheduledEmail(lesson.instructor_email, lesson.instructor_name, lesson.student_name, lesson.date, lesson.time).catch(console.error);
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
    const lesson = await getLessonWithStudent(req.params.id);
    if (lesson) sendLessonApprovedEmail(lesson.student_email, lesson.student_name, lesson.date, lesson.time).catch(console.error);
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
