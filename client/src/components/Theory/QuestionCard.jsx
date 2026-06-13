import { useState } from 'react';

export default function QuestionCard({ number, question, options, correct, image, selected, revealed, onAnswer }) {
  return (
    <div className="question-card">
      <p className="question-text"><strong>{number}. {question}</strong></p>
      {image && <img src={image} alt="תמרור" className="question-image" />}
      <div className="question-options">
        {options.map((opt, i) => {
          let state = '';
          if (selected !== null) {
            if (i === selected && selected === correct) state = 'correct';
            else if (i === selected && selected !== correct) state = 'wrong';
            else if (i === correct && revealed) state = 'correct';
          }
          return (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              disabled={revealed}
              className={`question-option ${state}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
