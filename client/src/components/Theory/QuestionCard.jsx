import { useState } from 'react';

export default function QuestionCard({ number, question, options, correct, image, selected, revealed, onAnswer }) {
  return (
    <div className="question-card" style={{ marginBottom: 24, padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
      <p><strong>{number}. {question}</strong></p>
      {image && <img src={image} alt="תמרור" style={{ maxWidth: 200, display: 'block', marginBottom: 8 }} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map((opt, i) => {
          let bg = '';
          if (selected !== null) {
            if (i === selected && selected === correct) bg = '#d4edda';
            else if (i === selected && selected !== correct) bg = '#f8d7da';
            else if (i === correct && revealed) bg = '#d4edda';
          }
          return (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              disabled={revealed}
              style={{ background: bg, textAlign: 'right', padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', cursor: revealed ? 'default' : 'pointer' }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
