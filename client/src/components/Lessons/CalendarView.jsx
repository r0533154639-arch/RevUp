import { useState, useEffect } from 'react';

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// lessons: [{ date, time, status, student_name?, instructor_name? }]
// availableSlots: { 'YYYY-MM-DD': [{ slot_index, time }] } — לתלמיד בלבד
export default function CalendarView({ lessons = [], availableSlots = {}, onBookSlot, onCancelLesson, role }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun

  // map תאריכים → שיעורים
  const lessonsByDate = {};
  for (const l of lessons) {
    const d = l.date?.slice(0, 10);
    if (!lessonsByDate[d]) lessonsByDate[d] = [];
    lessonsByDate[d].push(l);
  }

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelectedDate(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setSelectedDate(null); };

  const selectedDateStr = selectedDate ? toDateStr(year, month, selectedDate) : null;
  const selectedLessons = selectedDateStr ? (lessonsByDate[selectedDateStr] || []) : [];
  const selectedSlots = selectedDateStr ? (availableSlots[selectedDateStr] || []) : [];

  return (
    <div style={{ display: 'flex', gap: 20, direction: 'rtl', alignItems: 'flex-start' }}>
      {/* לוח שנה */}
      <div style={{ flex: 1 }}>
        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button onClick={nextMonth} style={navBtnStyle}>{'>'}</button>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{MONTHS_HE[month]} {year}</span>
          <button onClick={prevMonth} style={navBtnStyle}>{'<'}</button>
        </div>

        {/* כותרות ימים */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 4 }}>
          {DAYS_HE.map(d => <div key={d} style={{ fontSize: 12, color: '#888', padding: '2px 0' }}>{d}</div>)}
        </div>

        {/* ימים */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {/* ריקים לפני תחילת החודש */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`} />)}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dateStr = toDateStr(year, month, day);
            const isPast = new Date(dateStr) < new Date(today.toDateString());
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
                onClick={() => !isPast && setSelectedDate(day)}
                style={{
                  padding: '8px 2px',
                  textAlign: 'center',
                  borderRadius: 6,
                  background: bg,
                  color: isSelected ? '#fff' : isPast ? '#aaa' : '#222',
                  cursor: isPast ? 'default' : 'pointer',
                  fontWeight: isToday ? 700 : 400,
                  border: isToday ? '2px solid #3b82f6' : '1px solid transparent',
                  fontSize: 13,
                  position: 'relative',
                }}
              >
                {day}
                {hasLesson && (
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b', margin: '2px auto 0' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* פאנל צד */}
      {selectedDate && (
        <div style={{ width: 240, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>
            {selectedDate} {MONTHS_HE[month]}
          </div>

          {/* תלמיד: slots פנויים */}
          {role === 'student' && (
            <>
              {selectedSlots.length === 0
                ? <p style={{ color: '#888', fontSize: 13 }}>אין שעות פנויות ביום זה</p>
                : selectedSlots.map(s => (
                  <button
                    key={s.slot_index}
                    onClick={() => onBookSlot?.(selectedDateStr, s.time)}
                    style={{ display: 'block', width: '100%', marginBottom: 6, padding: '8px', borderRadius: 6, background: '#dbeafe', border: '1px solid #93c5fd', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {s.time}
                  </button>
                ))
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
                        onClick={() => onCancelLesson?.(l.id)}
                        style={{ marginTop: 4, fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
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
  );
}

const navBtnStyle = { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: '0 8px' };
