import { useState } from 'react';
import { DAYS_HE, MONTHS_HE } from '../../constants/index.js';

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

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
  const [selectedSlotTimes, setSelectedSlotTimes] = useState([]);
  const [cancelConfirm, setCancelConfirm] = useState(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const lessonsByDate = {};
  for (const l of lessons) {
    const d = new Date(l.date).toISOString().slice(0, 10);
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

  const selectedDateStr = selectedDate ? toDateStr(year, month, selectedDate) : null;
  const selectedLessons = selectedDateStr ? (lessonsByDate[selectedDateStr] || []) : [];
  const selectedSlots = selectedDateStr ? (availableSlots[selectedDateStr] || []) : [];
  const selectedIsPast = selectedDateStr ? isDatePast(selectedDateStr) : false;

  return (
    <>
      <div className="calendar-layout">
        <div className="calendar-grid-wrap">
          <div className="calendar-header">
            <button onClick={nextMonth} className="calendar-nav-btn">→</button>
            <span className="calendar-title">{MONTHS_HE[month]} {year}</span>
            <button onClick={prevMonth} className="calendar-nav-btn">←</button>
          </div>

          <div className="calendar-weekdays">
            {DAYS_HE.map(d => <div key={d} className="calendar-weekday">{d}</div>)}
          </div>

          <div className="calendar-days">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dateStr = toDateStr(year, month, day);
              const isPast = isDatePast(dateStr);
              const hasLesson = !!lessonsByDate[dateStr]?.length;
              const hasSlots = role === 'student' && (availableSlots[dateStr]?.length > 0);
              const isSelected = selectedDate === day;
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

              let dayClass = 'calendar-day';
              if (isPast && hasLesson) dayClass += ' past-lesson';
              else if (isPast) dayClass += ' past';
              else if (hasSlots) dayClass += ' has-slots';
              else if (hasLesson) dayClass += ' has-lesson';
              if (isSelected) dayClass += ' selected';
              if (isToday) dayClass += ' today';

              return (
                <div key={day} onClick={() => handleSelectDate(day)} className={dayClass}>
                  {day}
                  {hasLesson && <div className="calendar-day-dot" />}
                </div>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="calendar-side-panel">
            <div className="calendar-side-title">
              {selectedDate} {MONTHS_HE[month]} {year}
              {selectedIsPast && <span className="calendar-past-label">(עבר)</span>}
            </div>

            {role === 'student' && (
              <>
                {selectedIsPast ? (
                  selectedLessons.length === 0
                    ? <p className="calendar-empty-msg">אין שיעורים ביום זה</p>
                    : selectedLessons.map(l => (
                      <div key={l.id} className="calendar-lesson-card past">
                        <div className="calendar-lesson-time">{l.time?.slice(0, 5)}</div>
                        <div className="calendar-lesson-instructor">מורה: {l.instructor_name}</div>
                        <div className="calendar-lesson-status">{l.status}</div>
                      </div>
                    ))
                ) : (
                  <>
                    {selectedSlots.length === 0
                      ? <p className="calendar-empty-msg">אין שעות פנויות ביום זה</p>
                      : <>
                          <p className="calendar-slot-hint">בחר שעה אחת או יותר:</p>
                          {selectedSlots.map(s => {
                            const isChosen = selectedSlotTimes.includes(s.time);
                            return (
                              <button
                                key={s.slot_index}
                                onClick={() => toggleSlot(s.time)}
                                className={`calendar-slot-btn ${isChosen ? 'chosen' : ''}`}
                              >
                                {s.time} {isChosen ? '✓' : ''}
                              </button>
                            );
                          })}
                          {selectedSlotTimes.length > 0 && (
                            <button onClick={handleConfirmBook} className="calendar-book-btn">
                              קבע {selectedSlotTimes.length} שיעור{selectedSlotTimes.length > 1 ? 'ים' : ''}
                            </button>
                          )}
                        </>
                    }
                  </>
                )}
              </>
            )}

            {role !== 'student' && (
              <>
                {selectedLessons.length === 0
                  ? <p className="calendar-empty-msg">אין שיעורים ביום זה</p>
                  : selectedLessons.map(l => (
                    <div key={l.id} className={`calendar-lesson-card ${selectedIsPast ? 'past' : 'upcoming'}`}>
                      <div className="calendar-lesson-time">{l.time?.slice(0, 5)}</div>
                      <div>{l.student_name}</div>
                      {l.student_phone && <div className="calendar-lesson-phone">{l.student_phone}</div>}
                      <div className="calendar-lesson-status">{l.status}</div>
                      {!selectedIsPast && l.status !== 'cancelled' && (
                        <button onClick={() => setCancelConfirm(l.id)} className="calendar-cancel-btn">
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

      {cancelConfirm && (
        <div className="modal-overlay" onClick={() => setCancelConfirm(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <p className="modal-title">⚠️ ביטול שיעור</p>
            <p className="modal-text">האם אתה בטוח שברצונך לבטל את השיעור?</p>
            <div className="modal-actions">
              <button onClick={() => { onCancelLesson?.(cancelConfirm); setCancelConfirm(null); }} className="btn-danger">
                כן, בטל
              </button>
              <button className="btn-secondary" onClick={() => setCancelConfirm(null)}>לא, חזור</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
