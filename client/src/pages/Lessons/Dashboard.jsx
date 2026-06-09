import { useState } from 'react';
import { useProgress } from '../../hooks/useProgress.js';
import ProgressBar from '../../components/Common/ProgressBar.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function Dashboard() {
  const progress = useProgress();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleScheduleClick = () => {
    if (user?.role === 'student' && !user?.instructor_id) {
      setShowModal(true);
    } else {
      navigate(`/users/${user.id}/schedule`);
    }
  };

  return (
    <div>
      <h2>התקדמות שלי</h2>
      {progress && <ProgressBar completed={progress.completed_lessons} total={20} />}
      <button onClick={handleScheduleClick}>קבע שיעור</button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <p className="modal-title">⚠️ לא נבחר מורה</p>
            <p className="modal-text">לא ניתן לקבוע שיעורים לפני שבוחרים מורה נהיגה.</p>
            <div className="modal-actions">
              <button onClick={() => navigate(`/users/${user.id}/instructors`)}>לבחירת מורה לחץ כאן</button>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>סגור</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
