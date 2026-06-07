import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// TODO: להסיר כשיהיה תהליך בחירת מורה אמיתי
import { chooseInstructor } from '../../services/stats.service.js';

export default function InstructorCard({ instructor }) {
  const navigate = useNavigate();
  const [chosen, setChosen] = useState(false);
  const [loading, setLoading] = useState(false);

  // TODO: להסיר כשיהיה תהליך בחירת מורה אמיתי
  const handleChoose = async () => {
    setLoading(true);
    try {
      await chooseInstructor(instructor.id);
      setChosen(true);
    } catch {
      alert('שגיאה בבחירת המורה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>{instructor.name}</h3>
      <p>אזור: {instructor.area}</p>
      <p>דירוג: {instructor.rating} ⭐</p>
      <button onClick={() => navigate(`/lessons/schedule?instructor=${instructor.id}`)}>קבע שיעור</button>
      {/* TODO: להסיר כשיהיה תהליך בחירת מורה אמיתי */}
      {chosen
        ? <p>✅ {instructor.name} נבחר כמורה שלך</p>
        : <button onClick={handleChoose} disabled={loading}>{loading ? '...' : 'בחר כמורה שלי'}</button>
      }
    </div>
  );
}
