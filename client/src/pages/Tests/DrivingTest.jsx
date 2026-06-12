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

  if (phase === 'licensed') return (
    <div className="test-page" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 80 }}>🏆</div>
      <h2 style={{ fontSize: 32, color: '#22c55e', margin: '16px 0 8px' }}>מזל טוב!</h2>
      <p style={{ fontSize: 20, color: '#166534', fontWeight: 600 }}>עברת את טסט הנהיגה בהצלחה!</p>
      <p style={{ fontSize: 16, color: '#555', marginTop: 12 }}>ברוך הבא לעולם הנהגים המורשים 🚗</p>
      <div style={{ marginTop: 24, fontSize: 40 }}>🎉🎊🎉</div>
    </div>
  );

  if (phase === 'result' && test?.status === 'failed') return (
    <div className="test-page" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 80 }}>😔</div>
      <h2 style={{ fontSize: 28, color: '#ef4444', margin: '16px 0 8px' }}>לא עברת את הטסט הפעם</h2>
      <p style={{ fontSize: 16, color: '#555', marginTop: 8 }}>אל תתייאש! אפשר לנסות שוב.</p>
      <button style={{ marginTop: 24 }} onClick={handleRequest} disabled={sending}>
        {sending ? 'שולח...' : 'שלח בקשה למורה שיקבע טסט עבורי'}
      </button>
    </div>
  );

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
