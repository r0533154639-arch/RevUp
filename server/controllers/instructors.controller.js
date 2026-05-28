import { getAllInstructors, getInstructorSchedule, approveLessonById } from '../dal/instructors.dal.js';

export const getInstructors = async (req, res) => {
  const data = await getAllInstructors(req.query);
  res.json(data);
};

export const getSchedule = async (req, res) => {
  const data = await getInstructorSchedule(req.params.id);
  res.json(data);
};

export const approveLesson = async (req, res) => {
  await approveLessonById(req.params.id);
  res.json({ success: true });
};
