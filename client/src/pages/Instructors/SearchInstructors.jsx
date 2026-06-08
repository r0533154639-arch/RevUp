import { useState, useEffect } from 'react';
import InstructorCard from '../../components/Instructors/InstructorCard.jsx';
import { getInstructors } from '../../services/stats.service.js';

export default function SearchInstructors() {
  const [area, setArea] = useState('');
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    getInstructors(area).then(setInstructors);
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
        {instructors.length === 0
          ? <p style={{ color: '#888' }}>לא נמצאו מורים</p>
          : instructors.map((i) => <InstructorCard key={i.id} instructor={i} />)
        }
      </div>
    </div>
  );
}
