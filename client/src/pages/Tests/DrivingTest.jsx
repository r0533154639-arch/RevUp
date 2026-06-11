import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import '../../styles/tests.css';

const STATUS_LABELS = {
  scheduled: 'ממתין לתשובה',
  passed: 'עבר',
  failed: 'לא עבר',
};

export default function DrivingTest() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.get('/tests/status')
      .then(setStatus)
      .finally(() => setLoading(false));
  }, []);

  const handleRequest = async () => {
    setSending(true);
    try {
      await api.post('/tests/request');
      setSent(true);
      setStatus({ phase: 'requested' });
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="test-page">טוען...</div>;

  const { phase, test, completedLessons } = status || {};

  return (
    <div className="test-page">
      <h2>טסט נהיגה</h2>

      {phase === 'not_eligible' && (
        <p>לא יכול עדיין לקבוע טסט ({completedLessons}/28 שיעורים הושלמו)</p>
      )}

      {phase === 'eligible' && (
        <button onClick={handleRequest} disabled={sending}>
          {sending ? 'שולח...' : 'שלח בקשה למורה לקביעת טסט'}
        </button>
      )}

      {phase === 'requested' && (
        <p>הבקשה נשלחה למורה, ממתין לתאריך טסט</p>
      )}

      {phase === 'scheduled' && test && (
        <p>מועד הטסט: {new Date(test.date).toLocaleDateString('he-IL')}{test.time ? ` בשעה ${test.time}` : ''}</p>
      )}

      {phase === 'result' && test && (
        <p>סטטוס הטסט: {STATUS_LABELS[test.status] ?? test.status}</p>
      )}
      <br /><p>בהצלחה!!!</p>
    </div>
  );
}
