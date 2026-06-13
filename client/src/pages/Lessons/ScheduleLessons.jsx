import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { getLessons, scheduleLesson } from '../../services/lessons.service.js';
import { getMyGeneralFeedback } from '../../services/stats.service.js';
import { api } from '../../services/api.js';
import CalendarView from '../../components/Lessons/CalendarView.jsx';
import WeeklyTemplateEditor from '../../components/Lessons/WeeklyTemplateEditor.jsx';
import '../../styles/components.css';

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
    try { setNotifications(await api.get('/lessons/notifications')); } catch {}
  }, []);

  const fetchGeneralFeedback = useCallback(async () => {
    try { setGeneralFeedback(await getMyGeneralFeedback()); } catch {}
  }, []);

  const fetchTemplate = useCallback(async () => {
    if (!isInstructor) return;
    setTemplate(await api.get('/availability/template') || {});
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

  useEffect(() => { fetchLessons(); fetchNotifications(); if (!isInstructor) fetchGeneralFeedback(); if (isInstructor) fetchTemplate(); }, []);
  useEffect(() => { if (!isInstructor && instructorUserId) { const now = new Date(); fetchMonthSlots(now.getFullYear(), now.getMonth()); } }, [instructorUserId]);

  const handleBookSlot = async (date, time) => {
    await scheduleLesson({ instructorId: instructorUserId, date, time });
    fetchLessons(); fetchMonthSlots(currentMonth.year, currentMonth.month); fetchNotifications();
    setBookingSuccess(true); setTimeout(() => setBookingSuccess(false), 4000);
  };

  const handleCancelLesson = async (lessonId) => {
    const res = await api.put(`/availability/lessons/${lessonId}/cancel`);
    if (res.cancelled) { fetchLessons(); fetchNotifications(); } else setCancelModal({ message: res.message });
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
      <div className="page-container schedule-no-instructor">
        <p>עליך לבחור מורה לפני קביעת שיעורים</p>
        <button onClick={() => navigate(`/users/${user.id}/instructors`)}>חפש מורה</button>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const toDateStr = (d) => new Date(d).toISOString().slice(0, 10);
  const futureLessons = lessons.filter(l => toDateStr(l.date) >= today && l.status !== 'cancelled');
  const pastLessons = lessons.filter(l => toDateStr(l.date) < today || l.status === 'completed');

  const TABS = isInstructor
    ? [{ key: 'lessons', label: 'שיעורים' }, { key: 'calendar', label: 'לוח שנה' }, { key: 'template', label: 'זמינות קבועה' }, { key: 'override', label: 'שינוי לתאריך' }]
    : [{ key: 'lessons', label: 'השיעורים שלי' }, { key: 'calendar', label: 'קבע שיעור' }, { key: 'feedback', label: 'עדכונים מהמורה' }];

  return (
    <div className="page-container schedule-page">
      {notifications.pending.length > 0 && (
        <div className="schedule-alert schedule-alert-pending">
          ⏳ יש <strong>{notifications.pending.length}</strong> שיעורים הממתינים לאישורך:
          <ul>{notifications.pending.map(l => (
            <li key={l.id}>
              <span>{new Date(l.date).toLocaleDateString('he-IL')} {l.time?.slice(0, 5)} — {l.student_name}</span>
              <button className="pending-request-btn-approve" onClick={() => setActionModal({ type: 'approve', lesson: l })}>אשר ✓</button>
              <button className="pending-request-btn-reject" onClick={() => setActionModal({ type: 'reject-lesson', lesson: l })}>דחה ✕</button>
            </li>
          ))}</ul>
        </div>
      )}
      {notifications.cancelRejections?.length > 0 && isInstructor && (
        <div className="schedule-alert schedule-alert-rejection">
          🚫 תלמיד דחה את בקשת הביטול ל-{notifications.cancelRejections.length} שיעור{notifications.cancelRejections.length > 1 ? 'ים' : ''}:
          <ul>{notifications.cancelRejections.map(l => (
            <li key={l.id}>
              {new Date(l.date).toLocaleDateString('he-IL')} {l.time?.slice(0, 5)} — {l.student_name}
              <button className="lesson-card-btn lesson-card-btn-cancel" onClick={async () => { await api.put(`/availability/lessons/${l.id}/reject-cancel`); fetchNotifications(); }}>בירור הודעה</button>
            </li>
          ))}</ul>
        </div>
      )}
      {notifications.cancelRequests.length > 0 && (
        <div className="schedule-alert schedule-alert-cancel">
          ❌ {isInstructor ? 'תלמיד' : 'המורה'} ביקש לבטל {notifications.cancelRequests.length} שיעור{notifications.cancelRequests.length > 1 ? 'ים' : ''}:
          <ul>{notifications.cancelRequests.map(l => (
            <li key={l.id}>
              {new Date(l.date).toLocaleDateString('he-IL')} {l.time?.slice(0, 5)} {isInstructor ? `— ${l.student_name}` : `— ${l.instructor_name}`}
              <button className="lesson-card-btn lesson-card-btn-cancel" onClick={() => setActionModal({ type: 'cancel', lesson: l })}>אשר ביטול</button>
              {!isInstructor && <button className="lesson-card-btn lesson-card-btn-ack" onClick={() => setActionModal({ type: 'reject-cancel', lesson: l })}>דחה ביטול</button>}
            </li>
          ))}</ul>
        </div>
      )}

      <div className="schedule-header">
        <h2>שיעורי נהיגה</h2>
        <div className="schedule-tabs">{TABS.map(t => <button key={t.key} className={`schedule-tab ${view === t.key ? 'active' : ''}`} onClick={() => setView(t.key)}>{t.label}</button>)}</div>
      </div>

      {view === 'lessons' && (
        <div>
          {!isInstructor && (
            <div className="schedule-stats">
              <span>📚 סה"כ שיעורים: <strong>{lessons.length}</strong></span>
              <span>✅ שיעורים שעברו: <strong>{pastLessons.length}</strong></span>
              <span>⏳ שיעורים קרובים: <strong>{futureLessons.length}</strong></span>
            </div>
          )}
          <h3 className="schedule-section-title">שיעורים קרובים</h3>
          {futureLessons.length === 0 ? <p className="schedule-empty">אין שיעורים קרובים</p> : <div className="schedule-list">{futureLessons.map(l => <LessonCard key={l.id} lesson={l} isInstructor={isInstructor} onCancel={handleCancelLesson} onFeedbackSaved={fetchLessons} />)}</div>}
          <h3 className="schedule-section-title">היסטוריית שיעורים</h3>
          {pastLessons.length === 0 ? <p className="schedule-empty">אין שיעורים קודמים</p> : <div className="schedule-list">{[...pastLessons].reverse().map(l => <LessonCard key={l.id} lesson={l} isInstructor={isInstructor} past onFeedbackSaved={fetchLessons} />)}</div>}
        </div>
      )}

      {view === 'calendar' && (
        <>{bookingSuccess && <div className="schedule-success">✅ השיעור נשלח לאישור המורה! תקבל עדכון בהמשך.</div>}<CalendarView lessons={lessons} availableSlots={availableSlots} onBookSlot={handleBookSlot} onCancelLesson={handleCancelLesson} role={user.role} onMonthChange={(y, m) => { setCurrentMonth({ year: y, month: m }); if (!isInstructor) fetchMonthSlots(y, m); }} /></>
      )}

      {view === 'feedback' && !isInstructor && (
        <div>
          <h3 className="schedule-section-title">עדכונים מהמורה</h3>
          {generalFeedback.length === 0 ? <p className="schedule-empty">אין משובים עדיין</p> : <div className="schedule-feedback-list">{generalFeedback.map(f => (
            <div key={f.id} className="schedule-feedback-card">
              <div className="schedule-feedback-header"><span className="schedule-feedback-rating">דירוג: {f.rating}/5</span><span className="schedule-feedback-date">{new Date(f.created_at).toLocaleDateString('he-IL')}</span></div>
              <p className="schedule-feedback-notes">{f.notes}</p>
            </div>
          ))}</div>}
        </div>
      )}

      {view === 'template' && isInstructor && (
        <div><p className="schedule-override-hint">בחר את השעות הקבועות בהן אתה זמין בכל שבוע.</p><WeeklyTemplateEditor initialTemplate={template} onSave={handleSaveTemplate} loading={templateLoading} /></div>
      )}

      {view === 'override' && isInstructor && (
        <div className="schedule-override-section">
          <p className="schedule-override-hint">בחר תאריך ספציפי ועדכן את הזמינות שלך לאותו יום בלבד.</p>
          <input type="date" value={overrideDate} min={today} onChange={e => setOverrideDate(e.target.value)} className="schedule-override-input" />
          {overrideDate && <OverrideSlotsEditor date={overrideDate} instructorId={user.id} value={overrideSlots} onChange={setOverrideSlots} />}
          <button onClick={handleSaveOverride} className="schedule-save-btn">שמור שינוי</button>
        </div>
      )}

      {confirmModal && (
        <div className="modal-overlay"><div className="modal-box">
          <p className="modal-title">⚠️ שיעורים שיתבטלו</p>
          <p className="modal-text">שינוי הזמינות יגרום לביטול {confirmModal.conflicts.length} שיעורים שכבר נקבעו:</p>
          <ul className="modal-conflicts-list">{confirmModal.conflicts.map(c => <li key={c.id}>{c.date} {c.time?.slice(0, 5)} — {c.student_name}</li>)}</ul>
          <div className="modal-actions"><button onClick={handleConfirmCancel}>אשר וסיים</button><button className="btn-secondary" onClick={() => setConfirmModal(null)}>ביטול</button></div>
        </div></div>
      )}

      {actionModal && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}><div className="modal-box" onClick={e => e.stopPropagation()}>
          <p className="modal-title">{actionModal.type === 'approve' ? '✅ אישור שיעור' : actionModal.type === 'reject-lesson' ? '❌ דחיית שיעור' : actionModal.type === 'cancel' ? '⚠️ אישור ביטול שיעור' : '🚫 דחיית בקשת ביטול'}</p>
          <p className="modal-text">{actionModal.lesson.student_name ? <>תלמיד: <strong>{actionModal.lesson.student_name}</strong><br /></> : <>מורה: <strong>{actionModal.lesson.instructor_name}</strong><br /></>}תאריך: <strong>{new Date(actionModal.lesson.date).toLocaleDateString('he-IL')}</strong><br />שעה: <strong>{actionModal.lesson.time?.slice(0, 5)}</strong></p>
          <div className="modal-actions">
            <button className={`modal-action-btn ${actionModal.type === 'approve' ? 'success' : 'danger'}`} onClick={async () => {
              if (actionModal.type === 'approve') await api.put(`/lessons/${actionModal.lesson.id}/approve`);
              else if (actionModal.type === 'reject-lesson') await api.put(`/lessons/${actionModal.lesson.id}/reject`);
              else if (actionModal.type === 'cancel') await handleCancelLesson(actionModal.lesson.id);
              else await api.put(`/availability/lessons/${actionModal.lesson.id}/reject-cancel`);
              setActionModal(null); fetchLessons(); fetchNotifications();
            }}>{actionModal.type === 'approve' ? 'אשר' : actionModal.type === 'reject-lesson' ? 'דחה שיעור' : actionModal.type === 'cancel' ? 'אשר ביטול' : 'דחה ביטול'}</button>
            <button className="btn-secondary" onClick={() => setActionModal(null)}>סגור</button>
          </div>
        </div></div>
      )}

      {cancelModal && (
        <div className="modal-overlay"><div className="modal-box">
          <p className="modal-title">ℹ️ בקשת ביטול</p>
          <p className="modal-text">{cancelModal.message}</p>
          <div className="modal-actions"><button onClick={() => setCancelModal(null)}>הבנתי</button></div>
        </div></div>
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

  useEffect(() => { api.get(`/communication/feedback/${l.id}`).then(setFeedback).catch(() => {}); }, [l.id]);

  const handleSubmitFeedback = async () => {
    await api.post('/communication/feedback', { lessonId: l.id, studentId: l.student_id, rating: feedbackForm.rating, notes: feedbackForm.notes });
    setFeedback(await api.get(`/communication/feedback/${l.id}`));
    setShowFeedbackForm(false);
    onFeedbackSaved?.();
  };

  return (
    <div className={`lesson-card ${past ? 'past' : ''} ${l.status === 'cancelled' ? 'cancelled' : ''}`}>
      <div className="lesson-card-header">
        <div>
          <div className="lesson-card-date">{dateStr} — {l.time?.slice(0, 5)}</div>
          <div className="lesson-card-info">{isInstructor ? `תלמיד: ${l.student_name} ${l.student_phone ? `| ${l.student_phone}` : ''}` : `מורה: ${l.instructor_name}`}</div>
        </div>
        <div className="lesson-card-side">
          <span className="lesson-card-status" style={{ background: statusColor + '22', color: statusColor }}>{statusLabel}</span>
          {!past && l.status !== 'cancelled' && l.status !== 'pending' && onCancel && (
            <><button className="lesson-card-btn lesson-card-btn-cancel" onClick={() => setConfirmCancel(true)}>בטל שיעור</button>
            {confirmCancel && (
              <div className="modal-overlay" onClick={() => setConfirmCancel(false)}><div className="modal-box" onClick={e => e.stopPropagation()}>
                <p className="modal-title">⚠️ ביטול שיעור</p>
                <p className="modal-text">האם אתה בטוח שברצונך לבטל את השיעור ב-{dateStr}?</p>
                <div className="modal-actions"><button className="btn-danger" onClick={() => { onCancel(l.id); setConfirmCancel(false); }}>כן, בטל</button><button className="btn-secondary" onClick={() => setConfirmCancel(false)}>לא, חזור</button></div>
              </div></div>
            )}</>
          )}
          {!isInstructor && l.status === 'cancelled' && l.cancelled_by === 'instructor' && (
            <button className="lesson-card-btn lesson-card-btn-ack" onClick={async () => { await api.delete(`/lessons/${l.id}`); onFeedbackSaved?.(); }}>הבנתי, הסר מהרשימה</button>
          )}
          {isInstructor && new Date(l.date).toISOString().slice(0, 10) < new Date().toISOString().slice(0, 10) && (
            <button className="lesson-card-btn lesson-card-btn-feedback" onClick={() => setShowFeedbackForm(v => !v)}>{feedback ? 'ערוך משוב' : 'כתוב משוב'}</button>
          )}
        </div>
      </div>
      {isInstructor && showFeedbackForm && (
        <div className="lesson-feedback-form">
          <div className="lesson-feedback-row"><label className="lesson-feedback-label">ציון:</label><select value={feedbackForm.rating} onChange={e => setFeedbackForm(f => ({ ...f, rating: +e.target.value }))}>{[1,2,3,4,5].map(n => <option key={n}>{n}</option>)}</select></div>
          <textarea className="lesson-feedback-textarea" value={feedbackForm.notes} onChange={e => setFeedbackForm(f => ({ ...f, notes: e.target.value }))} placeholder="הערות על השיעור..." rows={3} />
          <div className="lesson-feedback-actions"><button onClick={handleSubmitFeedback}>שמור משוב</button><button className="btn-secondary" onClick={() => setShowFeedbackForm(false)}>ביטול</button></div>
        </div>
      )}
      {feedback && !showFeedbackForm && (
        <div className="lesson-feedback-display"><span className="label">משוב מורה: </span><span className="notes">{feedback.notes}</span><span className="score">| ציון: {feedback.progress_rating}/5</span></div>
      )}
    </div>
  );
}

function OverrideSlotsEditor({ date, instructorId, value, onChange }) {
  const [existing, setExisting] = useState([]);
  useEffect(() => { api.get(`/availability/${instructorId}/slots?date=${date}`).then(slots => setExisting(slots || [])).catch(() => {}); }, [date, instructorId]);

  const VISIBLE_SLOTS = Array.from({ length: 22 }, (_, i) => i + 8);
  const slotToTime = (slot) => `${String(Math.floor(slot * 45 / 60)).padStart(2, '0')}:${String(slot * 45 % 60).padStart(2, '0')}`;
  const existingSet = new Set(existing.map(s => s.slot_index));
  const toggle = (slot) => {
    const already = value.find(v => v.slot_index === slot);
    if (already) onChange(value.filter(v => v.slot_index !== slot));
    else onChange([...value, { slot_index: slot, is_available: !existingSet.has(slot) }]);
  };

  return (
    <div className="override-slots">{VISIBLE_SLOTS.map(slot => {
      const isAvailable = existingSet.has(slot);
      const isChanged = value.find(v => v.slot_index === slot);
      const finalAvailable = isChanged ? isChanged.is_available : isAvailable;
      return <button key={slot} type="button" onClick={() => toggle(slot)} className={`override-slot ${finalAvailable ? 'available' : ''} ${isChanged ? 'changed' : ''}`}>{slotToTime(slot)}</button>;
    })}</div>
  );
}
