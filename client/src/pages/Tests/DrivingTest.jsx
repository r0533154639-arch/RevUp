import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

export default function DrivingTest() {
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState({ date: '', location: '' });

  useEffect(() => { api.get('/tests').then(setTests); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/tests', form);
    api.get('/tests').then(setTests);
  };

  return (
    <div className="test-page">
      <h2>טסט נהיגה</h2>
      <form onSubmit={handleSubmit}>
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        <input placeholder="מיקום" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
        <button type="submit">קבע טסט</button>
      </form>
      <ul className="test-list">{tests.map(t => <li key={t.id} className="test-item">{t.date} - {t.status}</li>)}</ul>
    </div>
  );
}
