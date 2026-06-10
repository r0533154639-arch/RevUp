import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function InstructorStatusBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role !== 'instructor') return null;
  if (user?.profile_status === 'active') return null;

  const isDraft = user?.profile_status === 'draft';
  const isPending = user?.profile_status === 'pending';

  return (
    <div style={{
      background: isDraft ? '#fff3cd' : '#d1ecf1',
      border: `1px solid ${isDraft ? '#ffc107' : '#bee5eb'}`,
      color: isDraft ? '#856404' : '#0c5460',
      padding: '10px 16px',
      borderRadius: 6,
      margin: '12px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    }}>
      <span style={{ fontWeight: 500 }}>
        {isDraft
          ? '⚠️ עדכן את פרטי הפרופיל שלך כדי שתלמידים יוכלו למצוא אותך ולהתחיל את התהליך.'
          : 'ℹ️ הפרופיל שלך ממתין לאישור המנהל. נודיע לך כשיאושר.'}
      </span>
      {isDraft && (
        <button
          onClick={() => navigate(`/users/${user.id}/completeProfile`)}
          style={{
            background: '#ffc107',
            color: '#000',
            border: 'none',
            borderRadius: 4,
            padding: '4px 12px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontWeight: 600,
          }}
        >
          השלם פרופיל
        </button>
      )}
    </div>
  );
}
