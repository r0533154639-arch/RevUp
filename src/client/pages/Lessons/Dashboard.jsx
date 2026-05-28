import { useProgress } from '../../hooks/useProgress.js';
import ProgressBar from '../../components/Common/ProgressBar.jsx';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const progress = useProgress();
  const navigate = useNavigate();

  return (
    <div>
      <h2>התקדמות שלי</h2>
      {progress && <ProgressBar completed={progress.completed_lessons} total={20} />}
      <button onClick={() => navigate('/lessons/schedule')}>קבע שיעור</button>
    </div>
  );
}
