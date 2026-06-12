import { useState, useEffect } from 'react';
import StudentCard from '../../components/students/studentCard.jsx';
import { getMyStudents, updateStudentStatus } from '../../services/stats.service.js';
import { api } from '../../services/api.js';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [testRequests, setTestRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showScheduleForm, setShowScheduleForm] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ date: '', time: '' });

  const loadStudents = () => {
    getMyStudents()
      .then(setStudents)
      .catch(() => setError('שגיאה בטעינת התלמידים'))
      .finally(() => setLoading(false));
    api.get('/tests/requests')
      .then(setTestRequests)
      .catch(() => {});
    api.get('/student-requests/pending')
      .then(setPendingRequests)
      .catch(() => {});
  };

  useEffect(() => { loadStudents(); }, []);

  const handleStatusChange = async (studentId, status) => {
    await updateStudentStatus(studentId, status);
    loadStudents();
  };

  const handleScheduleTest = async (requestId) => {
    try {
      await api.post('/tests/schedule', {
        testRequestId: requestId,
        ...scheduleForm
      });
      setTestRequests(prev => prev.filter(r => r.id !== requestId));
      setShowScheduleForm(null);
      setScheduleForm({ date: '', time: '' });
      alert('הטסט נקבע בהצלחה!');
    } catch (err) {
      alert('שגיאה בקביעת הטסט: ' + err.message);
    }
  };

  const filtered = students.filter(s => s.name.includes(search));

  return (
    <div className="page-container">
      <h2>התלמידים שלי</h2>
      
      {pendingRequests.length > 0 && (
        <div style={{ background: '#f0f9ff', border: '1px solid #7dd3fc', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
          <p style={{ fontWeight: 700, color: '#0369a1', marginBottom: 10, fontSize: 15 }}>
            👤 {pendingRequests.length} תלמידים מבקשים להצטרף אליך:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingRequests.map(req => (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: 6, padding: '10px 14px', border: '1px solid #bae6fd' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{req.student_name}</div>
                  <div style={{ fontSize: 13, color: '#666' }}>
                    {req.student_phone && <span>📞 {req.student_phone} | </span>}
                    {req.vehicle_type && <span>🚗 {req.vehicle_type}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={async () => { await api.put(`/student-requests/${req.id}/approve`); loadStudents(); }}
                    style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                  >
                    אשר ✓
                  </button>
                  <button
                    onClick={async () => { await api.put(`/student-requests/${req.id}/reject`); loadStudents(); }}
                    style={{ background: 'none', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}
                  >
                    דחה ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {testRequests.length > 0 && (
        <div className="test-requests-section">
          <h3>בקשות לטסט</h3>
          {testRequests.map(request => (
            <div key={request.id} className="test-request-card">
              <span>{request.student_name} מבקש לקבוע טסט</span>
              <button onClick={() => setShowScheduleForm(request.id)}>קבע מועד</button>
              
              {showScheduleForm === request.id && (
                <div className="schedule-form">
                  <input
                    type="date"
                    value={scheduleForm.date}
                    onChange={e => setScheduleForm(f => ({ ...f, date: e.target.value }))}
                    placeholder="תאריך הטסט"
                  />
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={e => setScheduleForm(f => ({ ...f, time: e.target.value }))}
                    placeholder="שעת הטסט"
                  />
                  <button onClick={() => handleScheduleTest(request.id)}>אשר</button>
                  <button onClick={() => setShowScheduleForm(null)}>ביטול</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <input placeholder="חיפוש לפי שם תלמיד" value={search} onChange={e => setSearch(e.target.value)} />
      {loading && <p>טוען...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && filtered.length === 0 && <p>אין תלמידים עדיין</p>}
      <div className="students-list">
        {filtered.map(s => <StudentCard key={s.id} student={s} onStatusChange={handleStatusChange} />)}
      </div>
    </div>
  );
}
