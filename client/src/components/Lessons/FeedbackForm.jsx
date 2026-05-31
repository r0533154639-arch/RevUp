import { useState } from 'react';

export default function FeedbackForm({ lessonId, onSubmit }) {
  const [form, setForm] = useState({ rating: 5, comment: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(lessonId, form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={form.rating} onChange={(e) => setForm({ ...form, rating: +e.target.value })}>
        {[1,2,3,4,5].map(n => <option key={n}>{n}</option>)}
      </select>
      <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="הערות" />
      <button type="submit">שלח משוב</button>
    </form>
  );
}
