import { getStudentProgress, setStudentStatus } from '../dal/students.dal.js';

export const getProgress = async (req, res) => {
  const data = await getStudentProgress(req.user.id);
  res.json(data);
};

export const updateStatus = async (req, res) => {
  await setStudentStatus(req.user.id, req.body.status);
  res.json({ success: true });
};
