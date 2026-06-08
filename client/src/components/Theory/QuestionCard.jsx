import { useState } from 'react';

export default function QuestionCard({ number, question, options, correct }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div style={{ marginBottom: '24px', borderBottom: '1px solid #ccc', paddingBottom: '16px' }}>
      <p><strong>{number}. {question}</strong></p>
      <ol>
        {options.filter(o => o).map((opt, i) => (
          <li key={i}>{opt}</li>
        ))}
      </ol>
      <button onClick={() => setRevealed(r => !r)}>
        {revealed ? 'הסתר תשובה' : 'הצג תשובה נכונה'}
      </button>
      {revealed && (
        <p style={{ color: 'green', marginTop: '8px' }}>
          ✓ {options[correct]}
        </p>
      )}
    </div>
  );
}
