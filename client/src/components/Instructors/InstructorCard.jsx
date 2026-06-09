import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chooseInstructor } from '../../services/stats.service.js';
import { useAuth } from '../../hooks/useAuth.js';

const SERVER = 'http://localhost:3000';

export default function InstructorCard({ instructor }) {
  const navigate = useNavigate();
  const { user, setInstructorId } = useAuth();
  const [step, setStep] = useState(null); // null | 'confirm' | 'success'
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await chooseInstructor(instructor.id);
      setInstructorId(instructor.id);
      setStep('success');
    } catch {
      alert('שגיאה בבחירת המורה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 16, padding: 16, border: '1px solid #ddd', borderRadius: 8, alignItems: 'center' }}>
        <img
          src={instructor.photo ? `${SERVER}${instructor.photo}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(instructor.name)}
          alt={instructor.name}
          style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 4px' }}>{instructor.name}</h3>
          <p style={{ margin: '2px 0', color: '#555' }}>📍 {instructor.area}</p>
          <p style={{ margin: '2px 0', color: '#555' }}>📞 {instructor.phone}</p>
        </div>
        <button onClick={() => setStep('confirm')}>בחר כמורה שלי</button>
      </div>

      {step === 'confirm' && (
        <div className="modal-overlay" onClick={() => setStep(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <p className="modal-title">⚠️ שים לב</p>
            <p className="modal-text">
              בחירת מורה היא פעולה שאינה ניתנת לשינוי ללא בקשה מיוחדת ממנהל המערכת.
              <br /><br />
              האם אתה בטוח שברצונך לבחור את <strong>{instructor.name}</strong> כמורה שלך?
            </p>
            <div className="modal-actions">
              <button onClick={handleConfirm} disabled={loading}>{loading ? '...' : 'כן, אני בטוח'}</button>
              <button className="btn-secondary" onClick={() => setStep(null)}>ביטול</button>
            </div>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p className="modal-title">✅ המורה נבחר בהצלחה!</p>
            <p className="modal-text">{instructor.name} נבחר כמורה שלך.</p>
            <div className="modal-actions">
              <button onClick={() => navigate(`/users/${user.id}/schedule`)}>קביעת השיעור הראשון</button>
              <button className="btn-secondary" onClick={() => navigate(`/users/${user.id}/homePage`)}>חזרה לדף הבית</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
