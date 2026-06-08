import { getQuestionsPaginated } from '../dal/theory.dal.js';

export const getQuestions = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const data = await getQuestionsPaginated(page);
  res.json(data);
};
