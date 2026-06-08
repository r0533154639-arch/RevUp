import '../../env.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from '../../config/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const xml = readFileSync(resolve(__dirname, '../data/theoryexamhe-data.xml'), 'utf-8');

const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);

function stripHtml(str) {
  return str.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

function parseItem(itemXml) {
  const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
  if (!titleMatch) return null;
  const question = stripHtml(titleMatch[1]).replace(/\s+/g, ' ').trim();

  const cdataMatch = itemXml.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  if (!cdataMatch) return null;
  const cdata = cdataMatch[1];

  const catMatch = itemXml.match(/<category>([\s\S]*?)<\/category>/);
  const category = catMatch ? catMatch[1].trim() : null;

  const idMatch = question.match(/^(\d+)\./);
  const external_id = idMatch ? parseInt(idMatch[1]) : null;

  const answers = [...cdata.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m =>
    stripHtml(m[1]).replace(/\s+/g, ' ').trim()
  );
  if (answers.length < 2) return null;

  const liBlocks = [...cdata.matchAll(/<li>([\s\S]*?)<\/li>/g)];
  let correct_answer = 1;
  liBlocks.forEach((m, i) => {
    if (m[1].includes('id="correctAnswer')) correct_answer = i + 1;
  });

  while (answers.length < 4) answers.push('');

  return { external_id, question, answer1: answers[0], answer2: answers[1], answer3: answers[2], answer4: answers[3], correct_answer, category };
}

async function run() {
  const parsed = items.map(parseItem).filter(Boolean);
  console.log(`Parsed ${parsed.length} questions`);

  const sql = `INSERT INTO theory_questions (external_id, question, answer1, answer2, answer3, answer4, correct_answer, category)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE question=VALUES(question)`;

  for (const q of parsed) {
    await pool.query(sql, [q.external_id, q.question, q.answer1, q.answer2, q.answer3, q.answer4, q.correct_answer, q.category]);
  }

  console.log('Done importing theory questions.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
