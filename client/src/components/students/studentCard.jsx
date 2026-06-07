import { useState } from 'react';
import { submitLessonFeedback } from '../../services/stats.service.js';

export default function StudentCard({ student }) {
  const [open, setOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [form, setForm] = useState({ rating: 5, notes: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusLabels = {
    theory: 'תיאוריה',
    lessons: 'שיעורים מעשיים',
    test: 'מוכן לטסט',
    licensed: 'קיבל רישיון',
  };

  const handleSubmitFeedback = async () => {
    if (!student.last_lesson_id) return;
    setLoading(true);
    try {
      await submitLessonFeedback({
        lessonId: student.last_lesson_id,
        studentId: student.id,
        rating: form.rating,
        notes: form.notes,
      });
      setSent(true);
    } catch {
      alert('שגיאה בשליחת המשוב');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="student-card" onClick={() => setOpen(true)}>
        <span className="student-card-avatar">{student.name[0]}</span>
        <span className="student-card-name">{student.name}</span>
        <span className="student-card-status">{statusLabels[student.status] ?? student.status}</span>
      </div>

      {open && (
        <div className="student-modal-overlay" onClick={() => setOpen(false)}>
          <div className="student-modal" onClick={(e) => e.stopPropagation()}>
            <button className="student-modal-close" onClick={() => setOpen(false)}>✕</button>
            <div className="student-modal-avatar">{student.name[0]}</div>
            <h2>{student.name}</h2>

            <div className="student-modal-grid">
              <div className="student-modal-item">
                <span className="label">📧 אימייל</span>
                <span>{student.email ?? '—'}</span>
              </div>
              <div className="student-modal-item">
                <span className="label">📞 טלפון</span>
                <span>{student.phone ?? '—'}</span>
              </div>
              <div className="student-modal-item">
                <span className="label">🎂 תאריך לידה</span>
                <span>{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('he-IL') : '—'}</span>
              </div>
              <div className="student-modal-item">
                <span className="label">🚗 סוג רכב</span>
                <span>{student.vehicle_type ?? '—'}</span>
              </div>
              <div className="student-modal-item">
                <span className="label">📊 סטטוס</span>
                <span className={`status-badge status-${student.status}`}>{statusLabels[student.status] ?? student.status}</span>
              </div>
              <div className="student-modal-item">
                <span className="label">✅ שיעורים שהושלמו</span>
                <span>{student.lessons_done ?? 0}</span>
              </div>
              <div className="student-modal-item">
                <span className="label">📝 ציון תיאוריה</span>
                <span>{student.theory_score != null ? `${student.theory_score}%` : '—'}</span>
              </div>
              <div className="student-modal-item">
                <span className="label">🗓️ שיעור הבא</span>
                <span>{student.next_lesson ? new Date(student.next_lesson).toLocaleString('he-IL') : '—'}</span>
              </div>
            </div>

            {student.notes && (
              <div className="student-modal-notes">
                <span className="label">📋 הערות</span>
                <p>{student.notes}</p>
              </div>
            )}

            <button className="feedback-toggle-btn" onClick={() => { setFeedbackOpen(p => !p); setSent(false); }}>
              📋 {feedbackOpen ? 'סגור משוב' : 'כתוב משוב על השיעור האחרון'}
            </button>

            {feedbackOpen && (
              <div className="feedback-form">
                {sent ? (
                  <p className="feedback-sent">✅ המשוב נשלח לתלמיד בהצלחה</p>
                ) : (
                  <>
                    <div className="feedback-rating">
                      <span className="label">דירוג השיעור</span>
                      <div className="stars">
                        {[1,2,3,4,5].map(n => (
                          <span
                            key={n}
                            className={`star ${form.rating >= n ? 'active' : ''}`}
                            onClick={() => setForm(f => ({ ...f, rating: n }))}
                          >★</span>
                        ))}
                      </div>
                    </div>
                    <textarea
                      className="feedback-textarea"
                      placeholder={`כתוב משוב ל${student.name} על השיעור האחרון...`}
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      rows={4}
                    />
                    <button className="feedback-send-btn" onClick={handleSubmitFeedback} disabled={loading || !form.notes.trim()}>
                      {loading ? '...' : 'שלח משוב לתלמיד'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
