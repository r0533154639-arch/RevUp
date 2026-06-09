import { useState, useEffect } from 'react';
import StudentCard from '../../components/students/studentCard.jsx';
import { getMyStudents } from '../../services/stats.service.js';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyStudents()
      .then(setStudents)
      .catch(() => setError('שגיאה בטעינת התלמידים'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <h2>התלמידים שלי</h2>
      {loading && <p>טוען...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && students.length === 0 && <p>אין תלמידים עדיין</p>}
      <div className="students-list">
        {students.map(s => <StudentCard key={s.id} student={s} />)}
      </div>
    </div>
  );
}
