import { parseXML, getTheoryProgress, saveTheoryResult } from '../dal/theory.dal.js';
import { asyncHandler } from '../utils/controllerFactory.js';

export const getQuestions = asyncHandler(async (req, res) => {
  const allQuestions = await parseXML();
  const shuffled = allQuestions.sort(() => Math.random() - 0.5);
  res.json(shuffled.slice(0, 30));
});

export const submitExam = asyncHandler(async (req, res) => {
  const { score, total } = req.body;
  await saveTheoryResult(req.user.id, score, total);
  res.json({ success: true });
});

export const getProgress = asyncHandler(async (req, res) => {
  const progress = await getTheoryProgress(req.user.id);
  res.json(progress);
});
