import { useState } from 'react';

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const TOTAL_SLOTS = 32; // 24*60/45 ≈ 32 slots

const slotToTime = (slot) => {
  const total = slot * 45;
  const h = String(Math.floor(total / 60)).padStart(2, '0');
  const m = String(total % 60).padStart(2, '0');
  return `${h}:${m}`;
};

// slots סבירים: 06:00 (slot 8) עד 22:00 (slot 29)
const VISIBLE_SLOTS = Array.from({ length: 22 }, (_, i) => i + 8);

// slot 18 = 13:30, slot 19 = 14:15 — שישי מותר עד 14:00 (כולל slot 18)
const FRIDAY = 5;
const SATURDAY = 6;
const FRIDAY_LAST_SLOT = 18; // 13:30 — slot 19 כבר 14:15

const getAllowedSlots = (day) => {
  if (day === SATURDAY) return [];
  if (day === FRIDAY) return VISIBLE_SLOTS.filter(s => s <= FRIDAY_LAST_SLOT);
  return VISIBLE_SLOTS;
};

export default function WeeklyTemplateEditor({ initialTemplate = {}, onSave, loading }) {
  // template: { dayOfWeek: Set(slotIndexes) }
  const [template, setTemplate] = useState(() => {
    const t = {};
    for (let d = 0; d < 7; d++) {
      t[d] = new Set(initialTemplate[d] || []);
    }
    return t;
  });
  const [activeDay, setActiveDay] = useState(0);
  const [rangeStart, setRangeStart] = useState(null);

  const toggle = (day, slot) => {
    if (rangeStart !== null) {
      // סיום בחירת טווח
      const from = Math.min(rangeStart, slot);
      const to = Math.max(rangeStart, slot);
      setTemplate(prev => {
        const next = { ...prev, [day]: new Set(prev[day]) };
        for (let s = from; s <= to; s++) {
          if (getAllowedSlots(day).includes(s)) next[day].add(s);
        }
        return next;
      });
      setRangeStart(null);
    } else {
      setTemplate(prev => {
        const next = { ...prev, [day]: new Set(prev[day]) };
        next[day].has(slot) ? next[day].delete(slot) : next[day].add(slot);
        return next;
      });
    }
  };

  const selectAll = (day) => setTemplate(prev => ({ ...prev, [day]: new Set(getAllowedSlots(day)) }));
  const clearDay = (day) => { setTemplate(prev => ({ ...prev, [day]: new Set() })); setRangeStart(null); };

  const handleSave = () => {
    const slots = [];
    for (let d = 0; d < 7; d++) {
      for (const slot of template[d]) {
        slots.push({ day_of_week: d, slot_index: slot });
      }
    }
    onSave(slots);
  };

  return (
    <div style={{ direction: 'rtl' }}>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>
        לחץ על שעה אחת לבחירה/ביטול. לחץ על שעה לא נבחרת ואז על שעה נוספת לבחירת טווח.
      </p>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {DAYS.filter((_, d) => d !== SATURDAY).map((day, i) => {
          const d = i < SATURDAY ? i : i + 1;
          return (
          <button
            key={d}
            type="button"
            onClick={() => { setActiveDay(d); setRangeStart(null); }}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: '1px solid #ccc',
              background: activeDay === d ? '#3b82f6' : template[d].size > 0 ? '#dbeafe' : '#f5f5f5',
              color: activeDay === d ? '#fff' : '#333',
              fontWeight: activeDay === d ? 700 : 400,
              cursor: 'pointer',
            }}
          >
            {day}
            {template[d].size > 0 && (
              <span style={{ marginRight: 4, fontSize: 11, opacity: 0.8 }}>({template[d].size})</span>
            )}
          </button>
        )})}
      </div>

      <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600 }}>יום {DAYS[activeDay]}</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {rangeStart !== null && (
            <span style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>
              מין {slotToTime(rangeStart)} — לחץ על שעה נוספת לבחירת טווח
            </span>
          )}
          <button
            type="button"
            onClick={() => selectAll(activeDay)}
            style={{ fontSize: 12, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            בחר הכל
          </button>
          <button
            type="button"
            onClick={() => clearDay(activeDay)}
            style={{ fontSize: 12, color: '#666', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            נקה הכל
          </button>
        </div>
      </div>

      {activeDay === FRIDAY && (
        <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>ביום שישי ניתן לעבוד עד השעה 14:00 בלבד.</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {getAllowedSlots(activeDay).map(slot => {
          const selected = template[activeDay].has(slot);
          const isRangeStart = rangeStart === slot;
          const isInRange = rangeStart !== null && slot >= Math.min(rangeStart, slot) && slot <= Math.max(rangeStart, slot);
          return (
            <button
              key={slot}
              type="button"
              onClick={() => {
                if (rangeStart === null && !selected) {
                  // ליצירת טווח: לחיצה ראשונה על לא נבחר = שאל אם להתחיל טווח
                  setRangeStart(slot);
                } else {
                  toggle(activeDay, slot);
                }
              }}
              onDoubleClick={() => { setRangeStart(null); toggle(activeDay, slot); }}
              style={{
                padding: '8px 4px',
                borderRadius: 6,
                border: isRangeStart ? '2px solid #f59e0b' : selected ? '2px solid #3b82f6' : '1px solid #ddd',
                background: isRangeStart ? '#fef9c3' : selected ? '#3b82f6' : '#fafafa',
                color: isRangeStart ? '#92400e' : selected ? '#fff' : '#333',
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: selected || isRangeStart ? 600 : 400,
              }}
            >
              {slotToTime(slot)}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        style={{ marginTop: 20, padding: '10px 28px', borderRadius: 6, background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
      >
        {loading ? 'שומר...' : 'שמור זמינות'}
      </button>
    </div>
  );
}
