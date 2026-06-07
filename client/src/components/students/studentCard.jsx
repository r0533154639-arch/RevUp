import { useState } from 'react';

export default function StudentCard({ student }) {
  const [open, setOpen] = useState(false);

  const statusLabels = {
    theory: 'תיאוריה',
    practical: 'שיעורים מעשיים',
    test_ready: 'מוכן לטסט',
    licensed: 'קיבל רישיון',
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
          </div>
        </div>
      )}
    </>
  );
}
