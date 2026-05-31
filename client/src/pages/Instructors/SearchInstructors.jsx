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
    <div>
      <h2>חיפוש מורים</h2>
      <input placeholder="סנן לפי אזור" value={area} onChange={(e) => setArea(e.target.value)} />
      {instructors.map((i) => <InstructorCard key={i.id} instructor={i} />)}
    </div>
  );
}
