import { useState } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';

const SERVER = 'http://localhost:3000';

export default function InstructorCard({ instructor, requestStatus }) {
  const { user } = useAuth();
  const [step, setStep] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSendRequest = async () => {
    setLoading(true);
    try {
      await api.post('/student-requests', { instructorUserId: instructor.user_id });
      setStep('sent');
    } catch {
      alert('שגיאה בשליחת הבקשה');
    } finally {
      setLoading(false);
    }
  };

  const alreadySent = step === 'sent' || requestStatus === 'pending';
  const alreadyApproved = requestStatus === 'approved';

  return (
    <div className="instructor-card">
      <img
        src={instructor.profile_image
          ? `${SERVER}/uploads/${instructor.profile_image}`
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name)}`}
        alt={instructor.name}
        className="avatar"
        style={{ width: 72, height: 72 }}
      />
      <div className="instructor-info">
        <h3>{instructor.name}</h3>
        <p>📍 {instructor.area}</p>
        <p>📞 {instructor.phone}</p>
        {instructor.vehicle_types && <p>🚗 {instructor.vehicle_types}</p>}
        {instructor.avg_rating
          ? <p className="instructor-rating">{'★'.repeat(Math.round(instructor.avg_rating))}{'☆'.repeat(5 - Math.round(instructor.avg_rating))} ({instructor.avg_rating})</p>
          : <p className="instructor-no-rating">אין דירוג עדיין</p>
        }
      </div>

      {alreadyApproved ? (
        <span style={{ color: '#22c55e', fontWeight: 600 }}>✅ המורה שלי</span>
      ) : alreadySent ? (
        <span style={{ color: '#f59e0b', fontWeight: 600 }}>⏳ הבקשה נשלחה</span>
      ) : (
        <button onClick={() => setStep('confirm')}>בחר כמורה שלי</button>
      )}

      {step === 'confirm' && (
        <div className="modal-overlay" onClick={() => setStep(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <p className="modal-title">שליחת בקשה למורה</p>
            <p className="modal-text">
              בקשתך תישלח ל-<strong>{instructor.name}</strong> לאישור.
              תקבל עדכון לאחר שהמורה יגיב לבקשה.
            </p>
            <div className="modal-actions">
              <button onClick={handleSendRequest} disabled={loading}>
                {loading ? '...' : 'שלח בקשה'}
              </button>
              <button className="btn-secondary" onClick={() => setStep(null)}>ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
