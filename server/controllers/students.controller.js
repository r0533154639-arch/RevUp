import { getStudentProgress, setStudentStatus, getStudentsByInstructor, chooseInstructor, getInstructorAchievements, getStudentInstructor } from '../dal/students.dal.js';

export const getProgress = async (req, res) => {
  const data = await getStudentProgress(req.user.id);
  res.json(data);
};

export const updateStatus = async (req, res) => {
  await setStudentStatus(req.user.id, req.body.status);
  res.json({ success: true });
};

export const getMyStudents = async (req, res) => {
  const data = await getStudentsByInstructor(req.user.id);
  res.json(data);
};

export const selectInstructor = async (req, res) => {
  await chooseInstructor(req.user.id, req.body.instructorId);
  res.json({ success: true });
};

export const getAchievements = async (req, res) => {
  const data = await getInstructorAchievements(req.user.id);
  res.json(data);
};

export const getMyInstructor = async (req, res) => {
  const data = await getStudentInstructor(req.user.id);
  res.json({ instructor_id: data?.instructor_id ?? null });
};
