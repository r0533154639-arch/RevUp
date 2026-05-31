import { useState } from 'react';
import QuestionCard from '../../components/Theory/QuestionCard.jsx';

const questions = [
  { question: 'מה המהירות המותרת בעיר?', options: ['50', '80', '100', '30'], correct: 0 },
  { question: 'מה צבע אור עצור?', options: ['ירוק', 'כתום', 'אדום', 'כחול'], correct: 2 },
];

export default function TheoryExam() {
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(0);

  const handleAnswer = (correct) => {
    if (correct) setScore(s => s + 1);
    setDone(d => d + 1);
  };

  return (
    <div>
      <h2>מבחן תאוריה</h2>
      {questions.map((q, i) => <QuestionCard key={i} {...q} onAnswer={handleAnswer} />)}
      {done === questions.length && <p>ציון: {score}/{questions.length}</p>}
    </div>
  );
}
