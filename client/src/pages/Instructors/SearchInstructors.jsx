import { useState, useEffect } from 'react';
import InstructorCard from '../../components/Instructors/InstructorCard.jsx';
import { getInstructors } from '../../services/stats.service.js';

export default function SearchInstructors() {
  const [area, setArea] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');
    getInstructors(area)
      .then(data => {
        setInstructors(Array.isArray(data) ? data : []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [area]);

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
