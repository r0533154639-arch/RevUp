import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

const STATUS_LABEL = { pending: 'ממתין', approved: 'מאושר', completed: 'הושלם', cancelled: 'בוטל', unapproved: 'לא מאושר' };
const STATUS_COLOR = { pending: '#f59e0b', approved: '#3b82f6', completed: '#22c55e', cancelled: '#ef4444', unapproved: '#9ca3af' };

export default function LessonCard({ lesson: l, isInstructor, onCancel, past, onFeedbackSaved }) {
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
