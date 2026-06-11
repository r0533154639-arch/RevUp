import { useNavigate, useParams } from 'react-router-dom';
import MediaViewer from '../../components/Common/MediaViewer.jsx';

const materials = [
  { type: 'text', src: 'חוקי תנועה בסיסיים', alt: '' },
  { type: 'image', src: '/assets/signs.png', alt: 'תמרורים' },
];

export default function TheoryMaterials() {
  const navigate = useNavigate();
  const { username } = useParams();
  return (
    <div className="theory-page">
      <h2>חומרי לימוד - תאוריה</h2>
      {materials.map((m, i) => <MediaViewer key={i} {...m} />)}
      <div className="btn-row" style={{ marginTop: 16 }}>
        <button onClick={() => navigate('/theory/exam')}>לתרגול מבחן</button>
        <button className="btn-secondary" onClick={() => navigate(`/users/${username}/theorySchedule`)}>קביעת מועד לתאוריה</button>
      </div>
    </div>
  );
}
