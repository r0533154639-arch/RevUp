import { getStudentProgress, setStudentStatus, getStudentsByInstructor, chooseInstructor, getInstructorAchievements } from '../dal/students.dal.js';

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

// TODO: להסיר כשיהיה תהליך בחירת מורה אמיתי
export const selectInstructor = async (req, res) => {
  await chooseInstructor(req.user.id, req.body.instructorId);
  res.json({ success: true });
};

export const getAchievements = async (req, res) => {
  const data = await getInstructorAchievements(req.user.id);
  res.json(data);
};
