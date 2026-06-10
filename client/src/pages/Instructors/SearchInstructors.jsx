import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import InstructorCard from '../../components/Instructors/InstructorCard.jsx';
import { getInstructors } from '../../services/stats.service.js';
import { useAuth } from '../../hooks/useAuth.js';

export default function SearchInstructors() {
  const { user } = useAuth();
  const [area, setArea] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        const data = await getInstructors(area);
        setInstructors(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setInstructors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInstructors();
  }, [area]);

  if (user?.instructor_id) return <Navigate to={`/users/${user.id}/homePage`} />;

  return (
    <div className="page-container">
      <h2>חיפוש מורים</h2>
      <input
        placeholder="סנן לפי עיר / אזור"
        value={area}
        onChange={(e) => setArea(e.target.value)}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
        {loading && <p>טוען...</p>}
        {error && <p style={{ color: 'red' }}>שגיאה: {error}</p>}
        {!loading && !error && instructors.length === 0 && <p style={{ color: '#888' }}>לא נמצאו מורים</p>}
        {instructors.map((i) => <InstructorCard key={i.id} instructor={i} />)}
      </div>
    </div>
  );
}
