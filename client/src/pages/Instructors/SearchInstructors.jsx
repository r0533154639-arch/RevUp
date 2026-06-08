import { useState, useEffect } from 'react';
import InstructorCard from '../../components/Instructors/InstructorCard.jsx';
import { getInstructors } from '../../services/stats.service.js';

export default function SearchInstructors() {
  const [area, setArea] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        console.log('Fetching instructors with area:', area);
        const data = await getInstructors(area);
        console.log('Instructors data:', data);
        setInstructors(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching instructors:', err);
        setError(err.message);
        setInstructors([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInstructors();
  }, [area]);

  if (loading) return <div>טוען מורים...</div>;
  if (error) return <div>שגיאה: {error}</div>;

  return (
    <div className="page-container">
      <h2>חיפוש מורים</h2>
      <input
        placeholder="סנן לפי עיר / אזור"
        value={area}
        onChange={(e) => setArea(e.target.value)}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
        {instructors.length === 0
          ? <p style={{ color: '#888' }}>לא נמצאו מורים</p>
          : instructors.map((i) => <InstructorCard key={i.id} instructor={i} />)
        }
      </div>
    </div>
  );
}
