import { useState } from 'react';

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// בעיה 1: תיקון השוואת תאריכים — new Date('YYYY-MM-DD') מפרש כ-UTC ומחסיר יום
function isDatePast(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export default function CalendarView({ lessons = [], availableSlots = {}, onBookSlot, onCancelLesson, role, onMonthChange }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  // בעיה 2: שמירת slots שנבחרו (multi-select)
  const [selectedSlotTimes, setSelectedSlotTimes] = useState([]);
  // בעיה 3: modal אישור ביטול
  const [cancelConfirm, setCancelConfirm] = useState(null); // lessonId

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const lessonsByDate = {};
  for (const l of lessons) {
    const d = l.date?.slice(0, 10);
    if (!lessonsByDate[d]) lessonsByDate[d] = [];
    lessonsByDate[d].push(l);
  }

  const prevMonth = () => {
    const nm = month === 0 ? 11 : month - 1;
    const ny = month === 0 ? year - 1 : year;
    setMonth(nm); setYear(ny); setSelectedDate(null); setSelectedSlotTimes([]);
    onMonthChange?.(ny, nm);
  };
  const nextMonth = () => {
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    setMonth(nm); setYear(ny); setSelectedDate(null); setSelectedSlotTimes([]);
    onMonthChange?.(ny, nm);
  };

  const handleSelectDate = (day) => {
    setSelectedDate(day);
    setSelectedSlotTimes([]);
  };

  const toggleSlot = (time) => {
    setSelectedSlotTimes(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  const handleConfirmBook = async () => {
    if (!selectedSlotTimes.length || !selectedDate) return;
    const dateStr = toDateStr(year, month, selectedDate);
    for (const time of selectedSlotTimes) {
      await onBookSlot?.(dateStr, time);
    }
    setSelectedSlotTimes([]);
  };

  const handleCancelClick = (lessonId) => {
    setCancelConfirm(lessonId);
  };

  const handleConfirmCancel = () => {
    onCancelLesson?.(cancelConfirm);
    setCancelConfirm(null);
  };

  const selectedDateStr = selectedDate ? toDateStr(year, month, selectedDate) : null;
  const selectedLessons = selectedDateStr ? (lessonsByDate[selectedDateStr] || []) : [];
  const selectedSlots = selectedDateStr ? (availableSlots[selectedDateStr] || []) : [];

  return (
    <>
      <div style={{ display: 'flex', gap: 20, direction: 'rtl', alignItems: 'flex-start' }}>
        {/* לוח שנה */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <button onClick={nextMonth} style={navBtnStyle}>{'>'}</button>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{MONTHS_HE[month]} {year}</span>
            <button onClick={prevMonth} style={navBtnStyle}>{'<'}</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 4 }}>
            {DAYS_HE.map(d => <div key={d} style={{ fontSize: 12, color: '#888', padding: '2px 0' }}>{d}</div>)}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dateStr = toDateStr(year, month, day);
              const isPast = isDatePast(dateStr);
              const hasLesson = !!lessonsByDate[dateStr]?.length;
              const hasSlots = role === 'student' && (availableSlots[dateStr]?.length > 0);
              const isSelected = selectedDate === day;
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

              let bg = '#f0f0f0';
              if (hasSlots) bg = '#dbeafe';
              if (hasLesson && role !== 'student') bg = '#fef9c3';
              if (isSelected) bg = '#3b82f6';
              if (isPast) bg = '#e5e7eb';

              return (
                <div
                  key={day}
                  onClick={() => !isPast && handleSelectDate(day)}
                  style={{
                    padding: '8px 2px', textAlign: 'center', borderRadius: 6,
                    background: bg,
                    color: isSelected ? '#fff' : isPast ? '#aaa' : '#222',
                    cursor: isPast ? 'default' : 'pointer',
                    fontWeight: isToday ? 700 : 400,
                    border: isToday ? '2px solid #3b82f6' : '1px solid transparent',
                    fontSize: 13,
                  }}
                >
                  {day}
                  {hasLesson && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b', margin: '2px auto 0' }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* פאנל צד */}
        {selectedDate && (
          <div style={{ width: 260, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>
              {selectedDate} {MONTHS_HE[month]}
            </div>

            {/* תלמיד: slots פנויים */}
            {role === 'student' && (
              <>
                {selectedSlots.length === 0
                  ? <p style={{ color: '#888', fontSize: 13 }}>אין שעות פנויות ביום זה</p>
                  : <>
                      <p style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>בחר שעה אחת או יותר:</p>
                      {selectedSlots.map(s => {
                        const isChosen = selectedSlotTimes.includes(s.time);
                        return (
                          <button
                            key={s.slot_index}
                            onClick={() => toggleSlot(s.time)}
                            style={{
                              display: 'block', width: '100%', marginBottom: 6, padding: '8px',
                              borderRadius: 6,
                              background: isChosen ? '#3b82f6' : '#dbeafe',
                              border: isChosen ? '2px solid #1d4ed8' : '1px solid #93c5fd',
                              color: isChosen ? '#fff' : '#1d4ed8',
                              cursor: 'pointer', fontWeight: 600,
                            }}
                          >
                            {s.time} {isChosen ? '✓' : ''}
                          </button>
                        );
                      })}
                      {selectedSlotTimes.length > 0 && (
                        <button
                          onClick={handleConfirmBook}
                          style={{
                            marginTop: 10, width: '100%', padding: '10px',
                            background: '#22c55e', color: '#fff', border: 'none',
                            borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14,
                          }}
                        >
                          קבע {selectedSlotTimes.length} שיעור{selectedSlotTimes.length > 1 ? 'ים' : ''}
                        </button>
                      )}
                    </>
                }
              </>
            )}

            {/* מורה/אדמין: שיעורים שנקבעו */}
            {role !== 'student' && (
              <>
                {selectedLessons.length === 0
                  ? <p style={{ color: '#888', fontSize: 13 }}>אין שיעורים ביום זה</p>
                  : selectedLessons.map(l => (
                    <div key={l.id} style={{ marginBottom: 10, padding: 8, background: '#fef9c3', borderRadius: 6, fontSize: 13 }}>
                      <div style={{ fontWeight: 600 }}>{l.time?.slice(0, 5)}</div>
                      <div>{l.student_name}</div>
                      {l.student_phone && <div style={{ color: '#666' }}>{l.student_phone}</div>}
                      <div style={{ color: '#888', fontSize: 11 }}>{l.status}</div>
                      {l.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelClick(l.id)}
                          style={{ marginTop: 4, fontSize: 11, color: '#ef4444', background: 'none', border: '1px solid #fca5a5', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
                        >
                          בטל שיעור
                        </button>
                      )}
                    </div>
                  ))
                }
              </>
            )}
          </div>
        )}
      </div>

      {/* modal אישור ביטול */}
      {cancelConfirm && (
        <div className="modal-overlay" onClick={() => setCancelConfirm(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <p className="modal-title">⚠️ ביטול שיעור</p>
            <p className="modal-text">האם אתה בטוח שברצונך לבטל את השיעור?</p>
            <div className="modal-actions">
              <button onClick={handleConfirmCancel} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}>
                כן, בטל
              </button>
              <button className="btn-secondary" onClick={() => setCancelConfirm(null)}>
                לא, חזור
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const navBtnStyle = { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: '0 8px' };
