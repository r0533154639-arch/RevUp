import { useState, useEffect } from 'react';
import InstructorCard from '../../components/Instructors/InstructorCard.jsx';
import { getInstructors } from '../../services/stats.service.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';

export default function SearchInstructors() {
  const { user } = useAuth();
  const [area, setArea] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRequest, setMyRequest] = useState(null); // { status, instructor_name }

  useEffect(() => {
    api.get('/student-requests/my-status')
      .then(setMyRequest)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getInstructors(area)
      .then(data => setInstructors(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [area]);

  return (
    <div className="page-container">
      <h2>חיפוש מורים</h2>

      {/* סטטוס בקשה קיימת */}
      {myRequest?.status === 'pending' && (
        <div style={{ background: '#fef9c3', border: '1px solid #fbbf24', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#92400e', fontWeight: 500 }}>
          ⏳ בקשתך ל-<strong>{myRequest.instructor_name}</strong> ממתינה לאישור המורה.
        </div>
      )}
      {myRequest?.status === 'rejected' && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#991b1b', fontWeight: 500 }}>
          ❌ המורה <strong>{myRequest.instructor_name}</strong> דחה את בקשתך. תוכל לבחור מורה אחר.
        </div>
      )}
      {myRequest?.status === 'approved' && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#166534', fontWeight: 500 }}>
          ✅ <strong>{myRequest.instructor_name}</strong> אישר אותך כתלמיד שלו!
        </div>
      )}

      <input
        placeholder="סנן לפי עיר / אזור"
        value={area}
        onChange={(e) => setArea(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
        {loading && <p>טוען...</p>}
        {!loading && instructors.length === 0 && <p style={{ color: '#888' }}>לא נמצאו מורים</p>}
        {instructors.map(i => (
          <InstructorCard
            key={i.id}
            instructor={i}
            requestStatus={myRequest?.instructor_user_id === i.user_id ? myRequest?.status : null}
          />
        ))}
      </div>
    </div>
  );
}
