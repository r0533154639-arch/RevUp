import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';

const SERVER = 'http://localhost:3000';

function ProfileModal({ user: u, onClose, onBlock }) {
  console.log('ProfileModal user:', u);
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

function EditCellModal({ cell, onClose, onSave }) {
  const [value, setValue] = useState(cell.value ?? '');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ textAlign: 'right', minWidth: 320 }}>
        <p style={{ marginBottom: 8, fontWeight: 600 }}>עריכת: {cell.label}</p>
        {cell.options ? (
          <select
            value={value}
            onChange={e => setValue(e.target.value)}
            autoFocus
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
          >
            {cell.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
            autoFocus
          />
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' }}>
          <button
            onClick={() => onSave(value)}
            style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', cursor: 'pointer' }}
          >
            שמור
          </button>
          <button onClick={onClose} className="btn-secondary">ביטול</button>
        </div>
      </div>
    </div>
  );
}

const STUDENT_STATUSES = [
  { value: 'theory', label: 'תיאוריה' },
  { value: 'lessons', label: 'שיעורים' },
  { value: 'test', label: 'טסט' },
  { value: 'licensed', label: 'מורשה' },
];
const LESSON_STATUSES = [
  { value: 'pending', label: 'ממתין' },
  { value: 'approved', label: 'מאושר' },
  { value: 'unapproved', label: 'לא מאושר' },
  { value: 'completed', label: 'הושלם' },
  { value: 'cancelled', label: 'בוטל' },
];
const BLOCKED_OPTIONS = [
  { value: '0', label: '✅ פעיל' },
  { value: '1', label: '🚫 חסום' },
];

const tStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 14 };
const thStyle = { background: '#f3f4f6', padding: '8px 12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' };
const tdStyle = { padding: '7px 12px', borderBottom: '1px solid #e5e7eb' };
const tdEditStyle = { ...tdStyle, cursor: 'pointer' };
const linkBtn = { border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 13 };

export default function AdminDashboard({ user }) {
  const { page } = useParams();
  const navigate = useNavigate();
  const PAGE_TAB_MAP = { adminStudents: 'students', adminInstructors: 'instructors', adminPosts: 'posts', adminComments: 'comments', adminLessons: 'lessons' };
  const tab = PAGE_TAB_MAP[page] || 'students';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [lessonSort, setLessonSort] = useState('date');
  const [editCell, setEditCell] = useState(null); // { table, id, field, value, label }

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

  const openEdit = (table, id, field, value, label, options = null) => {
    setEditCell({ table, id, field, value, label, options });
  };

  const handleSave = async (newValue) => {
    const { table, id, field } = editCell;
    if (field === 'is_blocked') {
      await api.put(`/admin/users/${id}/block`, { block: newValue === '1' });
    } else {
      await api.put(`/admin/table/${table}/${id}`, { field, value: newValue });
    }
    setEditCell(null);
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
    { key: 'students', page: 'adminStudents', label: `תלמידים (${data.students?.length ?? 0})` },
    { key: 'instructors', page: 'adminInstructors', label: `מורים (${data.instructors?.length ?? 0})` },
    { key: 'posts', page: 'adminPosts', label: `פוסטים (${data.posts?.length ?? 0})` },
    { key: 'comments', page: 'adminComments', label: `תגובות (${data.comments?.length ?? 0})` },
    { key: 'lessons', page: 'adminLessons', label: `שיעורים (${data.lessons?.length ?? 0})` },
  ];

  return (
    <div className="page-container" style={{ direction: 'rtl' }}>
      {selected && <ProfileModal user={selected} onClose={() => setSelected(null)} onBlock={handleBlock} />}
      {editCell && <EditCellModal cell={editCell} onClose={() => setEditCell(null)} onSave={handleSave} />}

      <h2 style={{ marginBottom: 8 }}>ניהול האתר</h2>
      <p style={{ color: '#888', marginBottom: 4 }}>
        סה"כ משתמשים: {data.total_users} | תלמידים: {data.total_students} | מורים: {data.total_instructors}
      </p>
      <p style={{ color: '#aaa', fontSize: 12, marginBottom: 20 }}>💡 לחיצה כפולה על תא כדי לערוך</p>



      {tab === 'students' && (
        <table style={tStyle}>
          <thead><tr>{['שם', 'אימייל', 'טלפון', 'מורה', 'סטטוס', 'חסום', 'פרופיל'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {data.students.map(s => (
              <tr key={s.id}>
                <td style={tdEditStyle} onDoubleClick={() => openEdit('users', s.id, 'name', s.name, 'שם')}>{s.name}</td>
                <td style={tdEditStyle} onDoubleClick={() => openEdit('users', s.id, 'email', s.email, 'אימייל')}>{s.email}</td>
                <td style={tdEditStyle} onDoubleClick={() => openEdit('users', s.id, 'phone', s.phone, 'טלפון')}>{s.phone}</td>
                <td style={tdStyle}>{s.instructor_name || '—'}</td>
                <td style={tdEditStyle} onDoubleClick={() => openEdit('driving_students', s.id, 'status', s.status, 'סטטוס תלמיד', STUDENT_STATUSES)}>{s.status}</td>
                <td style={tdEditStyle} onDoubleClick={() => openEdit('users', s.id, 'is_blocked', String(s.is_blocked), 'חסימה', BLOCKED_OPTIONS)}>{s.is_blocked ? '🚫' : '✅'}</td>
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
                <td style={tdEditStyle} onDoubleClick={() => openEdit('users', i.id, 'name', i.name, 'שם')}>{i.name}</td>
                <td style={tdEditStyle} onDoubleClick={() => openEdit('users', i.id, 'email', i.email, 'אימייל')}>{i.email}</td>
                <td style={tdStyle}>{i.area || '—'}</td>
                <td style={tdStyle}>{i.student_count}</td>
                <td style={tdEditStyle} onDoubleClick={() => openEdit('users', i.id, 'is_blocked', String(i.is_blocked), 'חסימה', BLOCKED_OPTIONS)}>{i.is_blocked ? '🚫' : '✅'}</td>
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
                <td style={tdEditStyle} onDoubleClick={() => openEdit('posts', p.id, 'title', p.title, 'כותרת')}>{p.title}</td>
                <td style={{ ...tdEditStyle, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onDoubleClick={() => openEdit('posts', p.id, 'content', p.content, 'תוכן')}>{p.content}</td>
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
                <td style={{ ...tdEditStyle, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onDoubleClick={() => openEdit('post_comments', c.id, 'content', c.content, 'תוכן תגובה')}>{c.content}</td>
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
            <thead><tr>{['תאריך', 'שעה', 'תלמיד', 'מורה', 'סוג רכב', 'סטטוס', 'משוב מורה'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {sortedLessons.map(l => (
                <tr key={l.id}>
                  <td style={tdStyle}>{new Date(l.date).toLocaleDateString('he-IL')}</td>
                  <td style={tdStyle}>{l.time}</td>
                  <td style={tdStyle}>{l.student_name}</td>
                  <td style={tdStyle}>{l.instructor_name}</td>
                  <td style={tdStyle}>{l.vehicle_type || '—'}</td>
                  <td style={tdEditStyle} onDoubleClick={() => openEdit('driving_lessons', l.id, 'status', l.status, 'סטטוס שיעור')}>{l.status}</td>
                  <td
                    style={{ ...tdEditStyle, maxWidth: 220, color: l.feedback_notes ? '#111' : '#aaa', fontStyle: l.feedback_notes ? 'normal' : 'italic' }}
                    onDoubleClick={() => l.feedback_id && openEdit('lesson_feedback', l.feedback_id, 'notes', l.feedback_notes, 'משוב מורה')}
                    title={l.feedback_id ? 'לחץ פעמיים לעריכה' : 'לא נכתב משוב עדיין'}
                  >
                    {l.feedback_notes
                      ? l.feedback_notes
                      : l.feedback_id
                        ? '(ריק)'
                        : 'לא נכתב משוב עדיין'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
