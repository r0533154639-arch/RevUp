import { getTestsByStudent, createTest, createAppeal } from '../dal/tests.dal.js';

export const getTests = async (req, res) => {
  const data = await getTestsByStudent(req.user.id);
  res.json(data);
};

export const scheduleTest = async (req, res) => {
  const id = await createTest({ ...req.body, studentId: req.user.id });
  res.status(201).json({ id });
};

export const submitAppeal = async (req, res) => {
  await createAppeal(req.params.id, req.body);
  res.json({ success: true });
};
