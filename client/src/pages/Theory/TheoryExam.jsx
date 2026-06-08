import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import QuestionCard from '../../components/Theory/QuestionCard.jsx';

const PAGE_SIZE = 100;

export default function TheoryExam() {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/theory/questions?page=${page}`)
      .then(data => { setQuestions(data?.questions ?? []); setTotal(data?.total ?? 0); })
      .catch(err => { console.error('theory fetch error:', err); setError(err.message); })
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (loading) return <p>טוען שאלות...</p>;
  if (error) return <p>שגיאה: {error}</p>;

  return (
    <div>
      <h2>שאלות תאוריה</h2>
      <p>עמוד {page} מתוך {totalPages} | סה"כ {total} שאלות</p>
      {questions.map((q, i) => (
        <QuestionCard
          key={q.id}
          number={(page - 1) * PAGE_SIZE + i + 1}
          question={q.question}
          options={[q.answer1, q.answer2, q.answer3, q.answer4]}
          correct={q.correct_answer - 1}
        />
      ))}
      <div style={{ display: 'flex', gap: '8px', margin: '16px 0' }}>
        <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>הקודם</button>
        <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>הבא</button>
      </div>
    </div>
  );
}
