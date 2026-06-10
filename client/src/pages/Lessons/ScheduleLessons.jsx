import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { getLessons, scheduleLesson } from '../../services/lessons.service.js';
import { api } from '../../services/api.js';
import CalendarView from '../../components/Lessons/CalendarView.jsx';
import WeeklyTemplateEditor from '../../components/Lessons/WeeklyTemplateEditor.jsx';

export default function ScheduleLessons() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [availableSlots, setAvailableSlots] = useState({});
  const [template, setTemplate] = useState({});
  const [templateLoading, setTemplateLoading] = useState(false);
  const [view, setView] = useState('calendar'); // 'calendar' | 'template' | 'override'
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideSlots, setOverrideSlots] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null); // { conflicts, slots }
  const [cancelModal, setCancelModal] = useState(null); // { message }

  const isInstructor = user?.role === 'instructor';

  const fetchLessons = useCallback(async () => {
    const data = await getLessons();
    setLessons(Array.isArray(data) ? data : []);
  }, []);

  // טעינת תבנית שבועית למורה
  const fetchTemplate = useCallback(async () => {
    if (!isInstructor) return;
    const data = await api.get('/availability/template');
    setTemplate(data || {});
  }, [isInstructor]);

  // טעינת slots פנויים לחודש הנוכחי לתלמיד
  const fetchMonthSlots = useCallback(async (year, month) => {
    if (isInstructor || !user?.instructor_id) return;
    const instructorId = user.instructor_id;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const slotsMap = {};
    // טעינה מקבילית לכל ימות החודש
    await Promise.all(
      Array.from({ length: daysInMonth }, (_, i) => {
        const d = i + 1;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        return api.get(`/availability/${instructorId}/slots?date=${dateStr}`)
          .then(slots => { if (slots?.length) slotsMap[dateStr] = slots; })
          .catch(() => {});
      })
    );
    setAvailableSlots(slotsMap);
  }, [isInstructor, user?.instructor_id]);

  useEffect(() => {
    fetchLessons();
    if (isInstructor) fetchTemplate();
  }, []);

  useEffect(() => {
    if (!isInstructor && user?.instructor_id) {
      const now = new Date();
      fetchMonthSlots(now.getFullYear(), now.getMonth());
    }
  }, [user?.instructor_id]);

  const handleBookSlot = async (date, time) => {
    await scheduleLesson({ instructorId: user.instructor_id, date, time });
    fetchLessons();
    const now = new Date();
    fetchMonthSlots(now.getFullYear(), now.getMonth());
  };

  const handleCancelLesson = async (lessonId) => {
    const res = await api.put(`/availability/lessons/${lessonId}/cancel`);
    if (res.cancelled) {
      fetchLessons();
    } else {
      setCancelModal({ message: res.message });
    }
  };

  const handleSaveTemplate = async (slots) => {
    setTemplateLoading(true);
    try {
      const res = await api.put('/availability/template', { slots });
      if (res.requiresConfirmation) {
        setConfirmModal({ conflicts: res.conflicts, slots });
      } else {
        setTemplate({});
        fetchTemplate();
        setView('calendar');
      }
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    setTemplateLoading(true);
    try {
      await api.put('/availability/template', { slots: confirmModal.slots, forceCancel: true });
      setConfirmModal(null);
      fetchTemplate();
      fetchLessons();
      setView('calendar');
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleSaveOverride = async () => {
    if (!overrideDate) return;
    await api.put('/availability/override', { date: overrideDate, slots: overrideSlots });
    setOverrideSlots([]);
    setOverrideDate('');
    setView('calendar');
  };

  if (!isInstructor && !user?.instructor_id) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: 60 }}>
        <p style={{ fontSize: 18, marginBottom: 16 }}>עליך לבחור מורה לפני קביעת שיעורים</p>
        <button onClick={() => navigate(`/users/${user.id}/instructors`)}>חפש מורה</button>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ direction: 'rtl' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>{isInstructor ? 'לוח שיעורים' : 'קביעת שיעור'}</h2>
        {isInstructor && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setView('calendar')} style={tabBtn(view === 'calendar')}>לוח שנה</button>
            <button onClick={() => setView('template')} style={tabBtn(view === 'template')}>זמינות קבועה</button>
            <button onClick={() => setView('override')} style={tabBtn(view === 'override')}>שינוי לתאריך</button>
          </div>
        )}
      </div>

      {view === 'calendar' && (
        <CalendarView
          lessons={lessons}
          availableSlots={availableSlots}
          onBookSlot={handleBookSlot}
          onCancelLesson={handleCancelLesson}
          role={user.role}
        />
      )}

      {view === 'template' && isInstructor && (
        <div>
          <p style={{ color: '#555', marginBottom: 16 }}>בחר את השעות הקבועות בהן אתה זמין בכל שבוע.</p>
          <WeeklyTemplateEditor
            initialTemplate={template}
            onSave={handleSaveTemplate}
            loading={templateLoading}
          />
        </div>
      )}

      {view === 'override' && isInstructor && (
        <div style={{ maxWidth: 400 }}>
          <p style={{ color: '#555', marginBottom: 16 }}>בחר תאריך ספציפי ועדכן את הזמינות שלך לאותו יום בלבד.</p>
          <input
            type="date"
            value={overrideDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={e => setOverrideDate(e.target.value)}
            style={{ marginBottom: 16, padding: 8, borderRadius: 6, border: '1px solid #ccc', width: '100%' }}
          />
          {overrideDate && (
            <OverrideSlotsEditor
              date={overrideDate}
              instructorId={user.id}
              value={overrideSlots}
              onChange={setOverrideSlots}
            />
          )}
          <button onClick={handleSaveOverride} style={{ marginTop: 16, padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            שמור שינוי
          </button>
        </div>
      )}

      {/* modal אישור ביטול שיעורים */}
      {confirmModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p className="modal-title">⚠️ שיעורים שיתבטלו</p>
            <p className="modal-text">
              שינוי הזמינות יגרום לביטול {confirmModal.conflicts.length} שיעורים שכבר נקבעו:
            </p>
            <ul style={{ textAlign: 'right', maxHeight: 160, overflowY: 'auto', marginBottom: 12 }}>
              {confirmModal.conflicts.map(c => (
                <li key={c.id}>{c.date} {c.time?.slice(0, 5)} — {c.student_name}</li>
              ))}
            </ul>
            <p className="modal-text">האם לבטל את השיעורים ולשמור את הזמינות החדשה?</p>
            <div className="modal-actions">
              <button onClick={handleConfirmCancel}>אשר וסיים</button>
              <button className="btn-secondary" onClick={() => setConfirmModal(null)}>ביטול</button>
            </div>
          </div>
        </div>
      )}

      {/* modal ביטול שיעור קרוב */}
      {cancelModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p className="modal-title">ℹ️ בקשת ביטול</p>
            <p className="modal-text">{cancelModal.message}</p>
            <div className="modal-actions">
              <button onClick={() => setCancelModal(null)}>הבנתי</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// עורך override לתאריך ספציפי
function OverrideSlotsEditor({ date, instructorId, value, onChange }) {
  const [existing, setExisting] = useState([]);

  useEffect(() => {
    api.get(`/availability/${instructorId}/slots?date=${date}`)
      .then(slots => setExisting(slots || []))
      .catch(() => {});
  }, [date, instructorId]);

  const VISIBLE_SLOTS = Array.from({ length: 22 }, (_, i) => i + 8);
  const slotToTime = (slot) => {
    const total = slot * 45;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };

  const existingSet = new Set(existing.map(s => s.slot_index));

  const toggle = (slot) => {
    const isCurrentlyAvailable = existingSet.has(slot);
    const already = value.find(v => v.slot_index === slot);
    if (already) {
      onChange(value.filter(v => v.slot_index !== slot));
    } else {
      onChange([...value, { slot_index: slot, is_available: !isCurrentlyAvailable }]);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
      {VISIBLE_SLOTS.map(slot => {
        const isAvailable = existingSet.has(slot);
        const isChanged = value.find(v => v.slot_index === slot);
        const finalAvailable = isChanged ? isChanged.is_available : isAvailable;
        return (
          <button
            key={slot}
            type="button"
            onClick={() => toggle(slot)}
            style={{
              padding: '8px 4px',
              borderRadius: 6,
              border: isChanged ? '2px solid #f59e0b' : '1px solid #ddd',
              background: finalAvailable ? '#dbeafe' : '#f5f5f5',
              color: finalAvailable ? '#1d4ed8' : '#aaa',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {slotToTime(slot)}
          </button>
        );
      })}
    </div>
  );
}

const tabBtn = (active) => ({
  padding: '6px 14px',
  borderRadius: 20,
  border: '1px solid #ccc',
  background: active ? '#3b82f6' : '#f5f5f5',
  color: active ? '#fff' : '#333',
  cursor: 'pointer',
  fontWeight: active ? 700 : 400,
});
