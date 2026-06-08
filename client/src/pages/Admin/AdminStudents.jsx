import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import '../../styles/admin.css';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      console.log('Fetching students with token:', token ? 'exists' : 'missing');
      const res = await fetch('http://localhost:3000/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Response status:', res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        return;
      }
      const data = await res.json();
      console.log('Students data:', data);
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const updateStudentStatus = async (studentId) => {
    try {
      await fetch(`http://localhost:3000/api/admin/students/${studentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'licensed' })
      });
      fetchStudents();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const toggleUserBlock = async (userId, currentlyBlocked) => {
    try {
      const newBlockStatus = !currentlyBlocked;
      const res = await fetch(`http://localhost:3000/api/admin/users/${userId}/block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isBlocked: newBlockStatus })
      });

      if (res.ok) {
        fetchStudents();
        alert(newBlockStatus ? 'התלמיד נחסם בהצלחה' : 'החסימה הוסרה בהצלחה');
      } else {
        alert('שגיאה בעדכון סטטוס התלמיד');
      }
    } catch (err) {
      console.error('Error toggling user block:', err);
      alert('שגיאה בעדכון סטטוס התלמיד');
    }
  };

  return (
    <div className="admin-students">
      <h2>תלמידים</h2>
      <table>
        <thead>
          <tr>
            <th>שם</th>
            <th>אימייל</th>
            <th>סטטוס לימוד</th>
            <th>סטטוס משתמש</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id} className={student.is_blocked ? 'blocked-user' : ''}>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.status}</td>
              <td>
                <span className={`status-badge ${student.is_blocked ? 'blocked' : 'active'}`}>
                  {student.is_blocked ? 'חסום' : 'פעיל'}
                </span>
              </td>
              <td>
                {student.status === 'test' && !student.is_blocked && (
                  <button onClick={() => updateStudentStatus(student.id)}>
                    סמן כ-Licensed
                  </button>
                )}
                <button 
                  className={`block-btn ${student.is_blocked ? 'unblock' : 'block'}`}
                  onClick={() => toggleUserBlock(student.id, student.is_blocked)}
                >
                  {student.is_blocked ? 'בטל חסימה' : 'חסום'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}