import { parseXML } from '../dal/theory.dal.js';
import { getTheoryProgress, saveTheoryResult } from '../dal/theory.dal.js';

export const getQuestions = async (req, res) => {
  try {
    const allQuestions = await parseXML();
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    res.json(shuffled.slice(0, 30));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const submitExam = async (req, res) => {
  try {
    const { score, total } = req.body;
    const studentId = req.user.id;
    await saveTheoryResult(studentId, score, total);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProgress = async (req, res) => {
  try {
    const progress = await getTheoryProgress(req.user.id);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
