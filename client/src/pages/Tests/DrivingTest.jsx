import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { api } from '../../services/api.js';

const STATUS_LABELS = {
  scheduled: 'ממתין לתשובה',
  passed: 'עבר',
  failed: 'לא עבר',
};

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 6, fontSize: 32, cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          style={{ color: n <= (hovered || value) ? 'var(--warning)' : 'var(--border)', transition: 'color 0.1s' }}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
        >★</span>
      ))}
    </div>
  );
}

function InstructorReviewForm({ onSaved }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return alert('אנא בחר דירוג');
    setSaving(true);
    try {
      await api.post('/communication/instructor-review', { rating, comment });
      onSaved(rating);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: 28, background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', maxWidth: 400, margin: '28px auto 0', textAlign: 'right' }}>
      <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>⭐ דרג את המורה שלך</p>
      <StarRating value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="תגובה (אופציונלי)"
        rows={3}
        style={{ marginTop: 12, width: '100%', resize: 'vertical' }}
      />
      <button onClick={handleSubmit} disabled={saving || !rating} style={{ marginTop: 8 }}>
        {saving ? 'שומר...' : 'שלח דירוג'}
      </button>
    </div>
  );
}

export default function DrivingTest() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [existingReview, setExistingReview] = useState(undefined); // undefined = טרם נטען

  useEffect(() => {
    api.get('/tests/status')
      .then(setStatus)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (status?.phase === 'licensed') {
      api.get('/communication/instructor-review')
        .then(setExistingReview)
        .catch(() => setExistingReview(null));
    }
  }, [status?.phase]);

  const handleRequest = async () => {
    setSending(true);
    try {
      await api.post('/tests/request');
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
      <Link
        to={`/users/${user?.id}/newDriver`}
        style={{
          display: 'inline-block', marginTop: 28,
          background: '#6366f1', color: '#fff',
          padding: '12px 28px', borderRadius: 10,
          fontWeight: 700, fontSize: 16, textDecoration: 'none'
        }}
      >
        🚗 למדריך נהג חדש
      </Link>

      {existingReview === undefined && null}
      {existingReview !== undefined && (
        existingReview
          ? <div style={{ marginTop: 28, color: 'var(--success)', fontWeight: 600 }}>
              ✅ דירגת את המורה שלך: {'★'.repeat(existingReview.rating)}
            </div>
          : <InstructorReviewForm onSaved={r => setExistingReview({ rating: r })} />
      )}
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
