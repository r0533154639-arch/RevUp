import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import '../../styles/admin.css';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [testResultModal, setTestResultModal] = useState(null);
  const { token } = useAuth();

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      setStudents(await res.json());
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const updateTestResult = async (studentId, result) => {
    try {
      await fetch(`http://localhost:3000/api/admin/students/${studentId}/test-result`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ result })
      });
      setTestResultModal(null);
      fetchStudents();
    } catch (err) {
      alert('שגיאה: ' + err.message);
    }
  };

  const toggleUserBlock = async (userId, currentlyBlocked) => {
    try {
      const res = await fetch(`http://localhost:3000/api/admin/users/${userId}/block`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isBlocked: !currentlyBlocked })
      });
      if (res.ok) fetchStudents();
      else alert('שגיאה בעדכון סטטוס התלמיד');
    } catch (err) {
      alert('שגיאה: ' + err.message);
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
          {Array.isArray(students) && students.map(student => (
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
                {student.status === 'test' && (
                  <button onClick={() => setTestResultModal(student)}>עדכן תוצאות טסט</button>
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
          {(!Array.isArray(students) || students.length === 0) && (
            <tr><td colSpan="5">לא נמצאו תלמידים</td></tr>
          )}
        </tbody>
      </table>

      {testResultModal && (
        <div className="modal-overlay" onClick={() => setTestResultModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>עדכון תוצאות טסט - {testResultModal.name}</h3>
            <button onClick={() => updateTestResult(testResultModal.id, 'passed')}>✅ עבר</button>
            <button onClick={() => updateTestResult(testResultModal.id, 'failed')}>❌ לא עבר</button>
            <button onClick={() => setTestResultModal(null)}>ביטול</button>
          </div>
        </div>
      )}
    </div>
  );
}