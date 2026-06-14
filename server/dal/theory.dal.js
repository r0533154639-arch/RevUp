import { readFile } from 'fs/promises';
import { parseStringPromise } from 'xml2js';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const XML_PATH = path.join(__dirname, '../data/theoryexamhe-data.xml');

let cachedQuestions = null;

export const parseXML = async () => {
  if (cachedQuestions) return cachedQuestions;

  const xml = await readFile(XML_PATH, 'utf-8');
  const result = await parseStringPromise(xml, { explicitArray: true });
  const items = result.rss.channel[0].item;

  const questions = items.map((item) => {
    const titleRaw = item.title[0];
    // title format: "1234. question text"
    const dotIdx = titleRaw.indexOf('.');
    const id = titleRaw.substring(0, dotIdx).trim();
    const question = titleRaw.substring(dotIdx + 1).trim();

    const descHtml = item.description[0];
    const category = item.category?.[0] || '';

    const image = null; // external image domain not available

    // Extract <li> options
    const liRegex = /<li>([\s\S]*?)<\/li>/g;
    const options = [];
    let correctIndex = 0;
    let match;
    let i = 0;
    while ((match = liRegex.exec(descHtml)) !== null) {
      const liContent = match[1];
      const isCorrect = liContent.includes(`id="correctAnswer${id}"`);
      // strip tags
      const text = liContent.replace(/<[^>]+>/g, '').trim();
      if (text) {
        if (isCorrect) correctIndex = options.length;
        options.push(text);
      }
      i++;
    }

    return { id, question, options, correct: correctIndex, category, image };
  });

  cachedQuestions = questions;
  return questions;
};

export const getTheoryProgress = async (userId) => {
  const [[row]] = await pool.query(
    'SELECT * FROM theory_progress WHERE student_id = ?',
    [userId]
  );
  return row || { student_id: userId, total_demo_tests: 0, total_demo_questions: 0 };
};

export const saveTheoryResult = async (userId, score, total) => {
  await pool.query(
    `INSERT INTO theory_progress (student_id, total_demo_tests, total_demo_questions)
     VALUES (?, 1, ?)
     ON DUPLICATE KEY UPDATE
       total_demo_tests = LEAST(total_demo_tests + 1, 4),
       total_demo_questions = total_demo_questions + VALUES(total_demo_questions)`,
    [userId, total]
  );
};
