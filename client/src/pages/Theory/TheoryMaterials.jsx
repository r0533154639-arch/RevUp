import { useNavigate } from 'react-router-dom';
import MediaViewer from '../../components/Common/MediaViewer.jsx';

const materials = [
  { type: 'text', src: 'חוקי תנועה בסיסיים', alt: '' },
  { type: 'image', src: '/assets/signs.png', alt: 'תמרורים' },
];

export default function TheoryMaterials() {
  const navigate = useNavigate();
  return (
    <div>
      <h2>חומרי לימוד - תאוריה</h2>
      {materials.map((m, i) => <MediaViewer key={i} {...m} />)}
      <button onClick={() => navigate('/theory/exam')}>לתרגול מבחן</button>
    </div>
  );
}
