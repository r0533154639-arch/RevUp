import { useState, useEffect } from 'react';
import StudentCard from '../../components/students/studentCard.jsx';
import { getMyStudents } from '../../services/stats.service.js';
import { api } from '../../services/api.js';
import '../../styles/tests.css';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [testRequests, setTestRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showScheduleForm, setShowScheduleForm] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ date: '', time: '' });

  useEffect(() => {
    Promise.all([
      getMyStudents(),
      api.get('/tests/requests')
    ])
      .then(([studentsData, requestsData]) => {
        setStudents(studentsData);
        setTestRequests(requestsData);
      })
      .catch(() => setError('שגיאה בטעינת התלמידים'))
      .finally(() => setLoading(false));
  }, []);

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
        {filtered.map(s => <StudentCard key={s.id} student={s} />)}
      </div>
    </div>
  );
}
