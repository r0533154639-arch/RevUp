import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function InstructorStatusBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role !== 'instructor') return null;
  if (user?.profile_status === 'active') return null;

  const isDraft = user?.profile_status === 'draft';

  return (
    <div className={`instructor-banner ${isDraft ? 'draft' : 'pending'}`}>
      <span className="instructor-banner-text">
        {isDraft
          ? '⚠️ עדכן את פרטי הפרופיל שלך כדי שתלמידים יוכלו למצוא אותך ולהתחיל את התהליך.'
          : 'ℹ️ הפרופיל שלך ממתין לאישור המנהל. נודיע לך כשיאושר.'}
      </span>
      {isDraft && (
        <button className="instructor-banner-btn" onClick={() => navigate(`/users/${user.id}/completeProfile`)}>
          השלם פרופיל
        </button>
      )}
    </div>
  );
}
