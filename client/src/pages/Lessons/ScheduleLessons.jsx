import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { getLessons, scheduleLesson } from '../../services/lessons.service.js';
import { getMyGeneralFeedback } from '../../services/stats.service.js';
import { api } from '../../services/api.js';
import CalendarView from '../../components/Lessons/CalendarView.jsx';
import WeeklyTemplateEditor from '../../components/Lessons/WeeklyTemplateEditor.jsx';

const STATUS_LABEL = { pending: 'ממתין', approved: 'מאושר', completed: 'הושלם', cancelled: 'בוטל', unapproved: 'לא מאושר' };
const STATUS_COLOR = { pending: '#f59e0b', approved: '#3b82f6', completed: '#22c55e', cancelled: '#ef4444', unapproved: '#9ca3af' };

export default function ScheduleLessons() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isInstructor = user?.role === 'instructor';
  const instructorUserId = user?.instructor_user_id;

  const [lessons, setLessons] = useState([]);
  const [availableSlots, setAvailableSlots] = useState({});
  const [template, setTemplate] = useState({});
  const [templateLoading, setTemplateLoading] = useState(false);
  const [view, setView] = useState('lessons');
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideSlots, setOverrideSlots] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(() => ({ year: new Date().getFullYear(), month: new Date().getMonth() }));
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [notifications, setNotifications] = useState({ pending: [], cancelRequests: [], cancelRejections: [] });
  const [actionModal, setActionModal] = useState(null);
  const [generalFeedback, setGeneralFeedback] = useState([]);


  const fetchLessons = useCallback(async () => {
    const data = await getLessons();
    setLessons(Array.isArray(data) ? data : []);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.get('/lessons/notifications');
      setNotifications(data);
    } catch {}
  }, []);

  const fetchGeneralFeedback = useCallback(async () => {
    try {
      const data = await getMyGeneralFeedback();
      setGeneralFeedback(data);
    } catch {}
  }, []);

  const fetchTemplate = useCallback(async () => {
    if (!isInstructor) return;
    const data = await api.get('/availability/template');
    setTemplate(data || {});
  }, [isInstructor]);

  const fetchMonthSlots = useCallback(async (year, month) => {
    if (isInstructor || !instructorUserId) return;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const slotsMap = {};
    await Promise.all(
      Array.from({ length: daysInMonth }, (_, i) => {
        const d = i + 1;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        return api.get(`/availability/${instructorUserId}/slots?date=${dateStr}`)
          .then(slots => { if (slots?.length) slotsMap[dateStr] = slots; })
          .catch(() => {});
      })
    );
    setAvailableSlots(slotsMap);
  }, [isInstructor, instructorUserId]);

  useEffect(() => {
    fetchLessons();
    fetchNotifications();
    if (!isInstructor) { fetchGeneralFeedback(); }
    if (isInstructor) { fetchTemplate(); }
  }, []);

  useEffect(() => {
    if (!isInstructor && instructorUserId) {
      const now = new Date();
      fetchMonthSlots(now.getFullYear(), now.getMonth());
    }
  }, [instructorUserId]);

  const handleBookSlot = async (date, time) => {
    await scheduleLesson({ instructorId: instructorUserId, date, time });
    fetchLessons();
    fetchMonthSlots(currentMonth.year, currentMonth.month);
    fetchNotifications();
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 4000);
  };

  const handleCancelLesson = async (lessonId) => {
    const res = await api.put(`/availability/lessons/${lessonId}/cancel`);
    if (res.cancelled) { fetchLessons(); fetchNotifications(); }
    else setCancelModal({ message: res.message });
  };

  const handleSaveTemplate = async (slots) => {
    setTemplateLoading(true);
    try {
      const res = await api.put('/availability/template', { slots });
      if (res.requiresConfirmation) setConfirmModal({ conflicts: res.conflicts, slots });
      else { fetchTemplate(); setView('lessons'); }
    } finally { setTemplateLoading(false); }
  };

  const handleConfirmCancel = async () => {
    setTemplateLoading(true);
    try {
      await api.put('/availability/template', { slots: confirmModal.slots, forceCancel: true });
      setConfirmModal(null); fetchTemplate(); fetchLessons(); setView('lessons');
    } finally { setTemplateLoading(false); }
  };

  const handleSaveOverride = async () => {
    if (!overrideDate) return;
    await api.put('/availability/override', { date: overrideDate, slots: overrideSlots });
    setOverrideSlots([]); setOverrideDate(''); setView('lessons');
  };

  if (!isInstructor && !instructorUserId) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: 60 }}>
        <p>עליך לבחור מורה לפני קביעת שיעורים</p>
        <button onClick={() => navigate(`/users/${user.id}/instructors`)}>חפש מורה</button>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const toDateStr = (d) => new Date(d).toISOString().slice(0, 10);
  const futtureLessons = lessons.filter(l => toDateStr(l.date) >= today && l.status !== 'cancelled');
  const pastLessons = lessons.filter(l => toDateStr(l.date) < today || l.status === 'completed');

  const TABS = isInstructor
    ? [
        { key: 'lessons', label: 'שיעורים' },
        { key: 'calendar', label: 'לוח שנה' },
        { key: 'template', label: 'זמינות קבועה' },
        { key: 'override', label: 'שינוי לתאריך' },
      ]
    : [
        { key: 'lessons', label: 'השיעורים שלי' },
        { key: 'calendar', label: 'קבע שיעור' },
        { key: 'feedback', label: 'משובים' },
      ];

  return (
    <div className="page-container" style={{ direction: 'rtl' }}>

      {/* הודעות */}
      {notifications.pending.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: '12px 16px', marginBottom: 12, color: '#92400e' }}>
          ⏳ יש <strong>{notifications.pending.length}</strong> שיעורים הממתינים לאישורך:
          <ul style={{ margin: '6px 0 0', paddingRight: 20 }}>
            {notifications.pending.map(l => (
              <li key={l.id} style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{new Date(l.date).toLocaleDateString('he-IL')} {l.time?.slice(0, 5)} — {l.student_name}</span>
                <button
                  onClick={() => setActionModal({ type: 'approve', lesson: l })}
                  style={{ fontSize: 12, color: '#fff', background: '#22c55e', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
                >
                  אשר ✓
                </button>
                <button
                  onClick={() => setActionModal({ type: 'reject-lesson', lesson: l })}
                  style={{ fontSize: 12, color: '#ef4444', background: 'none', border: '1px solid #fca5a5', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
                >
                  דחה ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {notifications.cancelRejections?.length > 0 && isInstructor && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '12px 16px', marginBottom: 12, color: '#9a3412' }}>
          🚫 תלמיד דחה את בקשת הביטול ל-{notifications.cancelRejections.length} שיעור{notifications.cancelRejections.length > 1 ? 'ים' : ''}:
          <ul style={{ margin: '6px 0 0', paddingRight: 20 }}>
            {notifications.cancelRejections.map(l => (
              <li key={l.id} style={{ marginBottom: 4 }}>
                {new Date(l.date).toLocaleDateString('he-IL')} {l.time?.slice(0, 5)} — {l.student_name}
                <button
                  onClick={async () => { await api.put(`/availability/lessons/${l.id}/reject-cancel`); fetchNotifications(); }}
                  style={{ marginRight: 10, fontSize: 12, color: '#9a3412', background: 'none', border: '1px solid #fed7aa', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
                >
                  בירור הודעה
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {notifications.cancelRequests.length > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 12, color: '#991b1b' }}>
          ❌ {isInstructor ? 'תלמיד' : 'המורה'} ביקש לבטל {notifications.cancelRequests.length} שיעור{notifications.cancelRequests.length > 1 ? 'ים' : ''}:
          <ul style={{ margin: '6px 0 0', paddingRight: 20 }}>
            {notifications.cancelRequests.map(l => (
              <li key={l.id} style={{ marginBottom: 4 }}>
                {new Date(l.date).toLocaleDateString('he-IL')} {l.time?.slice(0, 5)}
                {isInstructor ? ` — ${l.student_name}` : ` — ${l.instructor_name}`}
                <button
                  onClick={() => setActionModal({ type: 'cancel', lesson: l })}
                  style={{ marginRight: 10, fontSize: 12, color: '#dc2626', background: 'none', border: '1px solid #fca5a5', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
                >
                  אשר ביטול
                </button>
                {!isInstructor && (
                  <button
                    onClick={() => setActionModal({ type: 'reject-cancel', lesson: l })}
                    style={{ marginRight: 6, fontSize: 12, color: '#6b7280', background: 'none', border: '1px solid #d1d5db', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
                  >
                    דחה ביטול
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>שיעורי נהיגה</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setView(t.key)} style={tabBtn(view === t.key)}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* תצוגת שיעורים */}
      {view === 'lessons' && (
        <div>
          {!isInstructor && (
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 24 }}>
              <span style={{ fontSize: 14, color: '#0369a1' }}>📚 סה"כ שיעורים: <strong>{lessons.length}</strong></span>
              <span style={{ fontSize: 14, color: '#0369a1' }}>✅ שיעורים שעברו: <strong>{pastLessons.length}</strong></span>
              <span style={{ fontSize: 14, color: '#0369a1' }}>⏳ שיעורים קרובים: <strong>{futtureLessons.length}</strong></span>
            </div>
          )}
          <h3 style={{ marginBottom: 12 }}>שיעורים קרובים</h3>
          {futtureLessons.length === 0
            ? <p style={{ color: '#aaa', marginBottom: 24 }}>אין שיעורים קרובים</p>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {futtureLessons.map(l => (
                  <LessonCard key={l.id} lesson={l} isInstructor={isInstructor} onCancel={handleCancelLesson} onFeedbackSaved={fetchLessons} />
                ))}
              </div>
          }

          <h3 style={{ marginBottom: 12 }}>היסטוריית שיעורים</h3>
          {pastLessons.length === 0
            ? <p style={{ color: '#aaa' }}>אין שיעורים קודמים</p>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...pastLessons].reverse().map(l => (
                  <LessonCard key={l.id} lesson={l} isInstructor={isInstructor} past onFeedbackSaved={fetchLessons} />
                ))}
              </div>
          }
        </div>
      )}

      {view === 'calendar' && (
        <>
          {bookingSuccess && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#166534', fontWeight: 600 }}>
              ✅ השיעור נשלח לאישור המורה! תקבל עדכון בהמשך.
            </div>
          )}
          <CalendarView
          lessons={lessons}
          availableSlots={availableSlots}
          onBookSlot={handleBookSlot}
          onCancelLesson={handleCancelLesson}
          role={user.role}
          onMonthChange={(y, m) => {
            setCurrentMonth({ year: y, month: m });
            if (!isInstructor) fetchMonthSlots(y, m);
          }}
        />
        </>
      )}

      {view === 'feedback' && !isInstructor && (
        <div>
          <h3 style={{ marginBottom: 12 }}>משובים מהמורה</h3>
          {generalFeedback.length === 0
            ? <p style={{ color: '#aaa' }}>אין משובים עדיין</p>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {generalFeedback.map(f => (
                  <div key={f.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>דירוג: {f.rating}/5</span>
                      <span style={{ color: '#666', fontSize: 13 }}>{new Date(f.created_at).toLocaleDateString('he-IL')}</span>
                    </div>
                    <p style={{ margin: 0, color: '#333' }}>{f.notes}</p>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {view === 'template' && isInstructor && (
        <div>
          <p style={{ color: '#555', marginBottom: 16 }}>בחר את השעות הקבועות בהן אתה זמין בכל שבוע.</p>
          <WeeklyTemplateEditor initialTemplate={template} onSave={handleSaveTemplate} loading={templateLoading} />
        </div>
      )}

      {view === 'override' && isInstructor && (
        <div style={{ maxWidth: 400 }}>
          <p style={{ color: '#555', marginBottom: 16 }}>בחר תאריך ספציפי ועדכן את הזמינות שלך לאותו יום בלבד.</p>
          <input
            type="date" value={overrideDate}
            min={today}
            onChange={e => setOverrideDate(e.target.value)}
            style={{ marginBottom: 16, padding: 8, borderRadius: 6, border: '1px solid #ccc', width: '100%' }}
          />
          {overrideDate && (
            <OverrideSlotsEditor date={overrideDate} instructorId={user.id} value={overrideSlots} onChange={setOverrideSlots} />
          )}
          <button onClick={handleSaveOverride} style={{ marginTop: 16, padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            שמור שינוי
          </button>
        </div>
      )}

      {confirmModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p className="modal-title">⚠️ שיעורים שיתבטלו</p>
            <p className="modal-text">שינוי הזמינות יגרום לביטול {confirmModal.conflicts.length} שיעורים שכבר נקבעו:</p>
            <ul style={{ textAlign: 'right', maxHeight: 160, overflowY: 'auto', marginBottom: 12 }}>
              {confirmModal.conflicts.map(c => <li key={c.id}>{c.date} {c.time?.slice(0, 5)} — {c.student_name}</li>)}
            </ul>
            <div className="modal-actions">
              <button onClick={handleConfirmCancel}>אשר וסיים</button>
              <button className="btn-secondary" onClick={() => setConfirmModal(null)}>ביטול</button>
            </div>
          </div>
        </div>
      )}

      {/* מודל אישור פעולה מהתראה */}
      {actionModal && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <p className="modal-title">
              {actionModal.type === 'approve' ? '✅ אישור שיעור' : actionModal.type === 'reject-lesson' ? '❌ דחיית שיעור' : actionModal.type === 'cancel' ? '⚠️ אישור ביטול שיעור' : '🚫 דחיית בקשת ביטול'}
            </p>
            <p className="modal-text">
              {actionModal.lesson.student_name
                ? <>{`תלמיד: `}<strong>{actionModal.lesson.student_name}</strong><br /></>
                : <>{`מורה: `}<strong>{actionModal.lesson.instructor_name}</strong><br /></>}
              תאריך: <strong>{new Date(actionModal.lesson.date).toLocaleDateString('he-IL')}</strong><br />
              שעה: <strong>{actionModal.lesson.time?.slice(0, 5)}</strong>
            </p>
            <div className="modal-actions">
              <button
                onClick={async () => {
                  if (actionModal.type === 'approve') {
                    await api.put(`/lessons/${actionModal.lesson.id}/approve`);
                  } else if (actionModal.type === 'reject-lesson') {
                    await api.put(`/lessons/${actionModal.lesson.id}/reject`);
                  } else if (actionModal.type === 'cancel') {
                    await handleCancelLesson(actionModal.lesson.id);
                  } else {
                    await api.put(`/availability/lessons/${actionModal.lesson.id}/reject-cancel`);
                  }
                  setActionModal(null);
                  fetchLessons();
                  fetchNotifications();
                }}
                style={{
                  background: actionModal.type === 'approve' ? '#22c55e' : actionModal.type === 'reject-lesson' ? '#ef4444' : actionModal.type === 'cancel' ? '#ef4444' : '#6b7280',
                  color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontWeight: 600
                }}
              >
                {actionModal.type === 'approve' ? 'אשר' : actionModal.type === 'reject-lesson' ? 'דחה שיעור' : actionModal.type === 'cancel' ? 'אשר ביטול' : 'דחה ביטול'}
              </button>
              <button className="btn-secondary" onClick={() => setActionModal(null)}>סגור</button>
            </div>
          </div>
        </div>
      )}

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

function LessonCard({ lesson: l, isInstructor, onCancel, past, onFeedbackSaved }) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, notes: '' });
  const dateStr = l.date ? new Date(l.date).toLocaleDateString('he-IL') : '';
  const statusColor = STATUS_COLOR[l.status] || '#9ca3af';
  const statusLabel = STATUS_LABEL[l.status] || l.status;

  useEffect(() => {
    api.get(`/communication/feedback/${l.id}`)
      .then(data => setFeedback(data))
      .catch(() => {});
  }, [l.id]);

  const handleSubmitFeedback = async () => {
    await api.post('/communication/feedback', {
      lessonId: l.id,
      studentId: l.student_id,
      rating: feedbackForm.rating,
      notes: feedbackForm.notes,
    });
    const updated = await api.get(`/communication/feedback/${l.id}`);
    setFeedback(updated);
    setShowFeedbackForm(false);
    onFeedbackSaved?.();
  };

  return (
    <div style={{
      background: past ? '#fafafa' : '#fff',
      border: `1px solid ${past ? '#e5e7eb' : '#d1d5db'}`,
      borderRadius: 10,
      padding: '14px 18px',
      opacity: l.status === 'cancelled' ? 0.6 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
            {dateStr} — {l.time?.slice(0, 5)}
          </div>
          {isInstructor
            ? <div style={{ color: '#555', fontSize: 13 }}>תלמיד: {l.student_name} {l.student_phone && `| ${l.student_phone}`}</div>
            : <div style={{ color: '#555', fontSize: 13 }}>מורה: {l.instructor_name}</div>
          }
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <span style={{ background: statusColor + '22', color: statusColor, borderRadius: 12, padding: '2px 10px', fontWeight: 600, fontSize: 12 }}>
            {statusLabel}
          </span>
          {!past && l.status !== 'cancelled' && l.status !== 'pending' && onCancel && (
            <>
              <button
                onClick={() => setConfirmCancel(true)}
                style={{ fontSize: 12, color: '#ef4444', background: 'none', border: '1px solid #fca5a5', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}
              >
                בטל שיעור
              </button>
              {confirmCancel && (
                <div className="modal-overlay" onClick={() => setConfirmCancel(false)}>
                  <div className="modal-box" onClick={e => e.stopPropagation()}>
                    <p className="modal-title">⚠️ ביטול שיעור</p>
                    <p className="modal-text">האם אתה בטוח שברצונך לבטל את השיעור ב-{dateStr}?</p>
                    <div className="modal-actions">
                      <button onClick={() => { onCancel(l.id); setConfirmCancel(false); }} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}>
                        כן, בטל
                      </button>
                      <button className="btn-secondary" onClick={() => setConfirmCancel(false)}>לא, חזור</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          {!isInstructor && l.status === 'cancelled' && l.cancelled_by === 'instructor' && (
            <button
              onClick={async () => {
                await api.delete(`/lessons/${l.id}`);
                onFeedbackSaved?.();
              }}
              style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}
            >
              הבנתי, הסר מהרשימה
            </button>
          )}
          {isInstructor && new Date(l.date).toISOString().slice(0, 10) < new Date().toISOString().slice(0, 10) && (
            <button
              onClick={() => setShowFeedbackForm(v => !v)}
              style={{ fontSize: 12, color: '#3b82f6', background: 'none', border: '1px solid #93c5fd', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}
            >
              {feedback ? 'ערוך משוב' : 'כתוב משוב'}
            </button>
          )}
        </div>
      </div>

      {/* טופס משוב למורה */}
      {isInstructor && showFeedbackForm && (
        <div style={{ marginTop: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 13 }}>ציון:</label>
            <select value={feedbackForm.rating} onChange={e => setFeedbackForm(f => ({ ...f, rating: +e.target.value }))}
              style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #ccc' }}>
              {[1,2,3,4,5].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <textarea
            value={feedbackForm.notes}
            onChange={e => setFeedbackForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="הערות על השיעור..."
            rows={3}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={handleSubmitFeedback} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 13 }}>
              שמור משוב
            </button>
            <button onClick={() => setShowFeedbackForm(false)} style={{ background: 'none', border: '1px solid #ccc', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* הצגת משוב — לכולם */}
      {feedback && !showFeedbackForm && (
        <div style={{ marginTop: 10, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, padding: '8px 12px', fontSize: 13 }}>
          <span style={{ fontWeight: 600, color: '#16a34a' }}>משוב מורה: </span>
          <span style={{ color: '#166534' }}>{feedback.notes}</span>
          <span style={{ marginRight: 8, color: '#15803d' }}>| ציון: {feedback.progress_rating}/5</span>
        </div>
      )}
    </div>
  );
}

function OverrideSlotsEditor({ date, instructorId, value, onChange }) {
  const [existing, setExisting] = useState([]);
  useEffect(() => {
    api.get(`/availability/${instructorId}/slots?date=${date}`)
      .then(slots => setExisting(slots || [])).catch(() => {});
  }, [date, instructorId]);

  const VISIBLE_SLOTS = Array.from({ length: 22 }, (_, i) => i + 8);
  const slotToTime = (slot) => {
    const total = slot * 45;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };
  const existingSet = new Set(existing.map(s => s.slot_index));
  const toggle = (slot) => {
    const already = value.find(v => v.slot_index === slot);
    if (already) onChange(value.filter(v => v.slot_index !== slot));
    else onChange([...value, { slot_index: slot, is_available: !existingSet.has(slot) }]);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
      {VISIBLE_SLOTS.map(slot => {
        const isAvailable = existingSet.has(slot);
        const isChanged = value.find(v => v.slot_index === slot);
        const finalAvailable = isChanged ? isChanged.is_available : isAvailable;
        return (
          <button key={slot} type="button" onClick={() => toggle(slot)} style={{
            padding: '8px 4px', borderRadius: 6,
            border: isChanged ? '2px solid #f59e0b' : '1px solid #ddd',
            background: finalAvailable ? '#dbeafe' : '#f5f5f5',
            color: finalAvailable ? '#1d4ed8' : '#aaa',
            fontSize: 13, cursor: 'pointer',
          }}>
            {slotToTime(slot)}
          </button>
        );
      })}
    </div>
  );
}

const tabBtn = (active) => ({
  padding: '6px 14px', borderRadius: 20, border: '1px solid #ccc',
  background: active ? '#3b82f6' : '#f5f5f5',
  color: active ? '#fff' : '#333',
  cursor: 'pointer', fontWeight: active ? 700 : 400,
});
