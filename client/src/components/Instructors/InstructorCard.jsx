import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// TODO: להסיר כשיהיה תהליך בחירת מורה אמיתי
import { chooseInstructor } from '../../services/stats.service.js';

const SERVER = 'http://localhost:3000';

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
    <div style={{ display: 'flex', gap: 16, padding: 16, border: '1px solid #ddd', borderRadius: 8, alignItems: 'center' }}>
      <img
        src={instructor.photo ? `${SERVER}${instructor.photo}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(instructor.name)}
        alt={instructor.name}
        style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 4px' }}>{instructor.name}</h3>
        <p style={{ margin: '2px 0', color: '#555' }}>📍 {instructor.area}</p>
        <p style={{ margin: '2px 0', color: '#555' }}>📞 {instructor.phone}</p>
      </div>
      <button onClick={() => navigate(`/lessons/schedule?instructor=${instructor.id}`)}>קבע שיעור</button>
      {/* TODO: להסיר כשיהיה תהליך בחירת מורה אמיתי */}
      {chosen
        ? <p>✅ {instructor.name} נבחר כמורה שלך</p>
        : <button onClick={handleChoose} disabled={loading}>{loading ? '...' : 'בחר כמורה שלי'}</button>
      }
    </div>
  );
}
