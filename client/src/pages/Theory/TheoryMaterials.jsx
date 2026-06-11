import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { updateStudentStatus } from '../../services/stats.service.js';
import MediaViewer from '../../components/Common/MediaViewer.jsx';

const materials = [
  { type: 'text', src: 'חוקי תנועה בסיסיים', alt: '' },
  { type: 'image', src: '/assets/signs.png', alt: 'תמרורים' },
];

export default function TheoryMaterials() {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePassedTheory = async () => {
    setLoading(true);
    try {
      await updateStudentStatus(undefined, 'lessons');
      navigate(`/users/${user.id}/instructors`);
    } catch {
      alert('שגיאה בעדכון הסטטוס');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theory-page">
      <h2>חומרי לימוד - תאוריה</h2>
      {materials.map((m, i) => <MediaViewer key={i} {...m} />)}
      <div className="btn-row" style={{ marginTop: 16 }}>
        <button onClick={() => navigate(`/users/${username}/theoryExam`)}>לתרגול מבחן</button>
        <button className="btn-secondary" onClick={() => navigate(`/users/${username}/theorySchedule`)}>קביעת מועד לתאוריה</button>
        <button onClick={handlePassedTheory} disabled={loading}>
          {loading ? '...' : '✅ עברתי תאוריה'}
        </button>
      </div>
    </div>
  );
}
