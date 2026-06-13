import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuestionCard from '../../components/Theory/QuestionCard.jsx';
import { api } from '../../services/api.js';

export default function TheoryExam() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { username } = useParams();

  useEffect(() => {
    api.get('/theory/questions')
      .then(data => setQuestions(data))
      .catch(() => setError('שגיאה בטעינת השאלות'))
      .finally(() => setLoading(false));
  }, []);

  const handleAnswer = (opt) => {
    if (answers[current] === undefined) {
      setAnswers(prev => ({ ...prev, [current]: opt }));
    }
  };

  const handleSubmit = async () => {
    const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
    await api.post('/theory/submit', { score, total: questions.length });
    setSubmitted(true);
  };

  if (loading) return <div className="theory-page"><p>טוען שאלות...</p></div>;
  if (error) return <div className="theory-page"><p>{error}</p></div>;

  const q = questions[current];
  const isLast = current === questions.length - 1;
  const answered = answers[current] !== undefined;
  const allAnswered = Object.keys(answers).length === questions.length;

  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
  const passed = score >= 24;

  if (submitted) {
    return (
      <div className="theory-page">
        <h2>תוצאות המבחן</h2>
        <div className={`theory-score ${passed ? 'pass' : 'fail'}`}>
          <p>ציון: {score}/{questions.length}</p>
          <p>{passed ? '✅ עברת את המבחן!' : '❌ לא עברת. נסה שוב.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="theory-page">
      <div className="theory-back-btn">
        <button className="btn-secondary" onClick={() => navigate(`/users/${username}/theory`)}>חזור לעמוד התאוריה</button>
      </div>
      <h2>שאלה {current + 1} מתוך {questions.length}</h2>
      <QuestionCard
        number={current + 1}
        {...q}
        selected={answers[current] ?? null}
        revealed={answered}
        onAnswer={handleAnswer}
      />
      <div className="theory-nav-row">
        <div>
          {current > 0 && <button className="btn-secondary" onClick={() => setCurrent(c => c - 1)}>→ שאלה קודמת</button>}
        </div>
        <div className="theory-nav-actions">
          {answered && <button className="btn-secondary" onClick={() => setAnswers(prev => { const n = {...prev}; delete n[current]; return n; })}>נקה בחירה</button>}
          {!isLast && <button onClick={() => setCurrent(c => c + 1)} disabled={!answered}>שאלה הבאה ←</button>}
          {isLast && allAnswered && <button onClick={handleSubmit}>סיים מבחן</button>}
        </div>
      </div>
    </div>
  );
}
