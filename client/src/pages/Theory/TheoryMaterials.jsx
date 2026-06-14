import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { updateStudentStatus } from '../../services/stats.service.js';


function ActionButton({ label, hint, variant, ...props }) {
  return (
    <div>
      <button className={variant === 'secondary' ? 'btn-secondary' : ''} {...props}>
        {label}
      </button>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>{hint}</span>
    </div>
  );
}

export default function TheoryMaterials() {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePassedTheory = async () => {
    setLoading(true);
    try {
      await updateStudentStatus(undefined, 'lessons');
      updateUser({ status: 'lessons' });
      navigate(`/users/${user.id}/instructors`);
    } catch {
      alert('שגיאה בעדכון הסטטוס');
    } finally {
      setLoading(false);
    }
  };

  const alreadyPassed = user?.status !== 'theory';

  return (
    <div className="theory-page">
      <h2>חומרי לימוד - תאוריה</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>
        לימוד התאוריה הוא הצעד הראשון בדרך לרישיון הנהיגה שלך. כאן תוכל להתאמן על שאלות מבחן אמיתיות,
        לקבוע מועד לבחינת התאוריה הרשמית, ולעדכן את הסטטוס שלך לאחר שעברת בהצלחה.
      </p>
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ActionButton
          label="לתרגול מבחן"
          hint="תרגל שאלות אמת מתוך בנק שאלות התאוריה הרשמי"
          onClick={() => navigate(`/users/${username}/theoryExam`)}
        />
        <ActionButton
          label="קביעת מועד לתאוריה"
          hint="קבע תאריך ושעה לבחינת התאוריה הרשמית שלך"
          onClick={() => navigate(`/users/${username}/theorySchedule`)}
          variant="secondary"
        />
        <ActionButton
          label={loading ? '...' : '✅ עברתי תאוריה'}
          hint="לחץ לאחר שעברת את בחינת התאוריה בהצלחה – הסטטוס שלך יתעדכן אוטומטית"
          onClick={handlePassedTheory}
          disabled={loading || alreadyPassed}
          style={alreadyPassed ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        />
      </div>
    </div>
  );
}
