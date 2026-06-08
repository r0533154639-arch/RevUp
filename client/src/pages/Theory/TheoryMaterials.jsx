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
    <div>
      <h2>חומרי לימוד - תאוריה</h2>
      {materials.map((m, i) => <MediaViewer key={i} {...m} />)}
      <button onClick={() => navigate(`/users/${username}/theoryExam`)}>לתרגול מבחן</button>
    </div>
  );
}
