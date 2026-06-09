import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

const SERVER = 'http://localhost:3000';

function ProfileModal({ user: u, onClose, onBlock }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ textAlign: 'right', minWidth: 300 }}>
        {u.profile_image && (
          <img src={`${SERVER}/uploads/${u.profile_image}`} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 12px' }} />
        )}
        <p><strong>שם:</strong> {u.name}</p>
        {u.email && <p><strong>אימייל:</strong> {u.email}</p>}
        {u.phone && <p><strong>טלפון:</strong> {u.phone}</p>}
        {u.date_of_birth && <p><strong>ת. לידה:</strong> {new Date(u.date_of_birth).toLocaleDateString('he-IL')}</p>}
        {u.area && <p><strong>אזור:</strong> {u.area}</p>}
        {u.vehicle_type && <p><strong>סוג רכב:</strong> {u.vehicle_type}</p>}
        {u.instructor_name && <p><strong>מורה:</strong> {u.instructor_name}</p>}
        {u.student_count !== undefined && <p><strong>תלמידים:</strong> {u.student_count}</p>}
        {'is_blocked' in u && <p><strong>סטטוס:</strong> {u.is_blocked ? '🚫 חסום' : '✅ פעיל'}</p>}
        {'is_blocked' in u && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
            <button
              onClick={() => onBlock(u)}
              style={{ background: u.is_blocked ? '#22c55e' : '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer' }}
            >
              {u.is_blocked ? 'בטל חסימה' : 'חסום משתמש'}
            </button>
            <button onClick={onClose} className="btn-secondary">סגור</button>
          </div>
        )}
        {'is_blocked' in u === false && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button onClick={onClose} className="btn-secondary">סגור</button>
          </div>
        )}
      </div>
    </div>
  );
}

const tStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 14 };
const thStyle = { background: '#f3f4f6', padding: '8px 12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' };
const tdStyle = { padding: '7px 12px', borderBottom: '1px solid #e5e7eb' };
const linkBtn = { border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 13 };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('students');
  const [selected, setSelected] = useState(null);
  const [lessonSort, setLessonSort] = useState('date');

  const load = () => {
    setLoading(true);
    api.get('/admin/dashboard').then(setData).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleBlock = async (u) => {
    await api.put(`/admin/users/${u.id}/block`, { block: !u.is_blocked });
    setSelected(null);
    load();
  };

  if (loading) return <div className="page-container"><p>טוען...</p></div>;
  if (!data) return null;

  const sortedLessons = [...(data.lessons || [])].sort((a, b) =>
    lessonSort === 'instructor'
      ? a.instructor_name.localeCompare(b.instructor_name)
      : new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time)
  );

  const TABS = [
    { key: 'students', label: `תלמידים (${data.students?.length ?? 0})` },
    { key: 'instructors', label: `מורים (${data.instructors?.length ?? 0})` },
    { key: 'posts', label: `פוסטים (${data.posts?.length ?? 0})` },
    { key: 'comments', label: `תגובות (${data.comments?.length ?? 0})` },
    { key: 'lessons', label: `שיעורים (${data.lessons?.length ?? 0})` },
  ];

  return (
    <div className="page-container" style={{ direction: 'rtl' }}>
      {selected && <ProfileModal user={selected} onClose={() => setSelected(null)} onBlock={handleBlock} />}

      <h2 style={{ marginBottom: 8 }}>ניהול האתר</h2>
      <p style={{ color: '#888', marginBottom: 20 }}>
        סה"כ משתמשים: {data.total_users} | תלמידים: {data.total_students} | מורים: {data.total_instructors}
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            ...linkBtn, padding: '8px 16px',
            background: tab === t.key ? '#3b82f6' : '#e5e7eb',
            color: tab === t.key ? '#fff' : '#111',
            fontWeight: tab === t.key ? 700 : 400,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'students' && (
        <table style={tStyle}>
          <thead><tr>{['שם', 'אימייל', 'טלפון', 'מורה', 'סטטוס', 'חסום', 'פרופיל'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {data.students.map(s => (
              <tr key={s.id}>
                <td style={tdStyle}>{s.name}</td>
                <td style={tdStyle}>{s.email}</td>
                <td style={tdStyle}>{s.phone}</td>
                <td style={tdStyle}>{s.instructor_name || '—'}</td>
                <td style={tdStyle}>{s.status}</td>
                <td style={tdStyle}>{s.is_blocked ? '🚫' : '✅'}</td>
                <td style={tdStyle}><button style={{ ...linkBtn, background: '#e5e7eb' }} onClick={() => setSelected(s)}>צפה</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'instructors' && (
        <table style={tStyle}>
          <thead><tr>{['שם', 'אימייל', 'אזור', 'תלמידים', 'חסום', 'פרופיל'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {data.instructors.map(i => (
              <tr key={i.id}>
                <td style={tdStyle}>{i.name}</td>
                <td style={tdStyle}>{i.email}</td>
                <td style={tdStyle}>{i.area || '—'}</td>
                <td style={tdStyle}>{i.student_count}</td>
                <td style={tdStyle}>{i.is_blocked ? '🚫' : '✅'}</td>
                <td style={tdStyle}><button style={{ ...linkBtn, background: '#e5e7eb' }} onClick={() => setSelected(i)}>צפה</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'posts' && (
        <table style={tStyle}>
          <thead><tr>{['כותרת', 'תוכן', 'מחבר', 'תאריך', 'פרופיל מחבר'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {data.posts.map(p => (
              <tr key={p.id}>
                <td style={tdStyle}>{p.title}</td>
                <td style={{ ...tdStyle, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.content}</td>
                <td style={tdStyle}>{p.author_name}</td>
                <td style={tdStyle}>{new Date(p.created_at).toLocaleDateString('he-IL')}</td>
                <td style={tdStyle}>
                  <button style={{ ...linkBtn, background: '#e5e7eb' }} onClick={() => setSelected({ id: p.author_id, name: p.author_name, profile_image: p.author_image })}>
                    פרופיל
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'comments' && (
        <table style={tStyle}>
          <thead><tr>{['תוכן', 'כותב', 'פוסט', 'תאריך'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {data.comments.map(c => (
              <tr key={c.id}>
                <td style={{ ...tdStyle, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.content}</td>
                <td style={tdStyle}>{c.author_name}</td>
                <td style={tdStyle}>{c.post_title}</td>
                <td style={tdStyle}>{new Date(c.created_at).toLocaleDateString('he-IL')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'lessons' && (
        <>
          <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>מיין לפי:</span>
            {['date', 'instructor'].map(s => (
              <button key={s} onClick={() => setLessonSort(s)} style={{
                ...linkBtn,
                background: lessonSort === s ? '#3b82f6' : '#e5e7eb',
                color: lessonSort === s ? '#fff' : '#111',
              }}>
                {s === 'date' ? 'תאריך' : 'מורה'}
              </button>
            ))}
          </div>
          <table style={tStyle}>
            <thead><tr>{['תאריך', 'שעה', 'תלמיד', 'מורה', 'סוג רכב', 'סטטוס'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {sortedLessons.map(l => (
                <tr key={l.id}>
                  <td style={tdStyle}>{new Date(l.date).toLocaleDateString('he-IL')}</td>
                  <td style={tdStyle}>{l.time}</td>
                  <td style={tdStyle}>{l.student_name}</td>
                  <td style={tdStyle}>{l.instructor_name}</td>
                  <td style={tdStyle}>{l.vehicle_type || '—'}</td>
                  <td style={tdStyle}>{l.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
