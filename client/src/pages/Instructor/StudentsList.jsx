import { useState, useEffect } from 'react';
import StudentCard from '../../components/students/studentCard.jsx';
import { getMyStudents } from '../../services/stats.service.js';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getMyStudents()
      .then(setStudents)
      .catch(() => setError('שגיאה בטעינת התלמידים'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s => s.name.includes(search));

  return (
    <div className="page-container">
      <h2>התלמידים שלי</h2>
      <input placeholder="חיפוש לפי שם תלמיד" value={search} onChange={e => setSearch(e.target.value)} />
      {loading && <p>טוען...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && filtered.length === 0 && <p>אין תלמידים עדיין</p>}
      <div className="students-list">
        {filtered.map(s => <StudentCard key={s.id} student={s} />)}
      </div>
    </div>
  );
}
