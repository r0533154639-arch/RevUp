import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import '../../styles/admin.css';

export default function AdminInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      console.log('Fetching instructors...');
      const res = await fetch('http://localhost:3000/api/admin/instructors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server error:', errorText);
        setInstructors([]); // מגדיר מערך ריק במקרה של שגיאה
        return;
      }
      
      const data = await res.json();
      console.log('Instructors data:', data);
      setInstructors(Array.isArray(data) ? data : []); // וודא שזה מערך
    } catch (err) {
      console.error('Error fetching instructors:', err);
      setInstructors([]); // מגדיר מערך ריק במקרה של שגיאה
    }
  };

  const fetchInstructorAchievements = async (instructorId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/admin/instructors/${instructorId}/achievements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAchievements(data);
      setSelectedInstructor(instructorId);
    } catch (err) {
      console.error('Error fetching achievements:', err);
    }
  };

  const toggleUserBlock = async (userId, currentlyBlocked) => {
    try {
      const newBlockStatus = !currentlyBlocked;
      console.log('Blocking user:', userId, 'new status:', newBlockStatus);
      
      const res = await fetch(`http://localhost:3000/api/admin/users/${userId}/block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isBlocked: newBlockStatus })
      });

      console.log('Response status:', res.status);
      const responseText = await res.text();
      console.log('Response:', responseText);

      if (res.ok) {
        fetchInstructors();
        alert(newBlockStatus ? 'המורה נחסם בהצלחה' : 'החסימה הוסרה בהצלחה');
      } else {
        console.error('Server error:', responseText);
        alert('שגיאה בעדכון סטטוס המורה: ' + responseText);
      }
    } catch (err) {
      console.error('Error toggling user block:', err);
      alert('שגיאה בעדכון סטטוס המורה: ' + err.message);
    }
  };

  return (
    <div className="admin-instructors">
      <h2>מורי נהיגה</h2>
      <div className="instructors-list">
        {Array.isArray(instructors) && instructors.map(instructor => (
          <div key={instructor.id} className={`instructor-card ${instructor.is_blocked ? 'blocked' : ''}`}>
            <h3>{instructor.name}</h3>
            <p>אזור: {instructor.area}</p>
            <p>אימייל: {instructor.email}</p>
            <div className="status">
              סטטוס: 
              <span className={`status-badge ${instructor.is_blocked ? 'blocked' : 'active'}`}>
                {instructor.is_blocked ? 'חסום' : 'פעיל'}
              </span>
            </div>
            {!instructor.is_blocked && (
              <button onClick={() => fetchInstructorAchievements(instructor.id)}>
                הצג הישגים
              </button>
            )}
            <button 
              className={`block-btn ${instructor.is_blocked ? 'unblock' : 'block'}`}
              onClick={() => toggleUserBlock(instructor.id, instructor.is_blocked)}
            >
              {instructor.is_blocked ? 'בטל חסימה' : 'חסום'}
            </button>
          </div>
        ))}
        {!Array.isArray(instructors) || instructors.length === 0 && (
          <p>לא נמצאו מורים</p>
        )}
      </div>

      {achievements && selectedInstructor && (
        <div className="achievements-modal">
          <h3>הישגי המורה</h3>
          <div>סך תלמידים: {achievements.totalStudents}</div>
          <div>תלמידים שעברו: {achievements.passedStudents}</div>
          <div>דירוג ממוצע: {achievements.averageRating}</div>
          <div>שיעורים שהועברו: {achievements.totalLessons}</div>
          <button onClick={() => setAchievements(null)}>סגור</button>
        </div>
      )}
    </div>
  );
}