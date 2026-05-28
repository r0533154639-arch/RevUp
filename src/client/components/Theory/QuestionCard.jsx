import { useState } from 'react';

export default function QuestionCard({ question, options, correct, onAnswer }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (i) => {
    setSelected(i);
    onAnswer?.(i === correct);
  };

  return (
    <div>
      <p>{question}</p>
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => handleSelect(i)}
          style={{ background: selected === null ? '' : i === correct ? 'green' : i === selected ? 'red' : '' }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
