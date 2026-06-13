import { useState } from 'react';
import { DAYS_HE } from '../../constants/index.js';

const VISIBLE_SLOTS = Array.from({ length: 22 }, (_, i) => i + 8);
const FRIDAY = 5;
const SATURDAY = 6;
const FRIDAY_LAST_SLOT = 18;

const slotToTime = (slot) => {
  const total = slot * 45;
  const h = String(Math.floor(total / 60)).padStart(2, '0');
  const m = String(total % 60).padStart(2, '0');
  return `${h}:${m}`;
};

const getAllowedSlots = (day) => {
  if (day === SATURDAY) return [];
  if (day === FRIDAY) return VISIBLE_SLOTS.filter(s => s <= FRIDAY_LAST_SLOT);
  return VISIBLE_SLOTS;
};

export default function WeeklyTemplateEditor({ initialTemplate = {}, onSave, loading }) {
  const [template, setTemplate] = useState(() => {
    const t = {};
    for (let d = 0; d < 7; d++) t[d] = new Set(initialTemplate[d] || []);
    return t;
  });
  const [activeDay, setActiveDay] = useState(0);
  const [rangeStart, setRangeStart] = useState(null);

  const toggle = (day, slot) => {
    if (rangeStart !== null) {
      const from = Math.min(rangeStart, slot);
      const to = Math.max(rangeStart, slot);
      setTemplate(prev => {
        const next = { ...prev, [day]: new Set(prev[day]) };
        for (let s = from; s <= to; s++) if (getAllowedSlots(day).includes(s)) next[day].add(s);
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
    for (let d = 0; d < 7; d++) for (const slot of template[d]) slots.push({ day_of_week: d, slot_index: slot });
    onSave(slots);
  };

  return (
    <div className="template-editor">
      <p className="template-hint">לחץ על שעה אחת לבחירה/ביטול. לחץ על שעה לא נבחרת ואז על שעה נוספת לבחירת טווח.</p>
      <div className="template-days">
        {DAYS_HE.filter((_, d) => d !== SATURDAY).map((day, i) => {
          const d = i < SATURDAY ? i : i + 1;
          return (
            <button key={d} type="button" onClick={() => { setActiveDay(d); setRangeStart(null); }}
              className={`template-day-btn ${activeDay === d ? 'active' : ''} ${template[d].size > 0 ? 'has-slots' : ''}`}>
              {day}{template[d].size > 0 && <span className="template-day-count">({template[d].size})</span>}
            </button>
          );
        })}
      </div>
      <div className="template-header">
        <span className="template-day-label">יום {DAYS_HE[activeDay]}</span>
        <div className="template-actions">
          {rangeStart !== null && <span className="template-range-hint">מין {slotToTime(rangeStart)} — לחץ על שעה נוספת לבחירת טווח</span>}
          <button type="button" onClick={() => selectAll(activeDay)} className="template-action-btn">בחר הכל</button>
          <button type="button" onClick={() => clearDay(activeDay)} className="template-action-btn secondary">נקה הכל</button>
        </div>
      </div>
      {activeDay === FRIDAY && <p className="template-friday-note">ביום שישי ניתן לעבוד עד השעה 14:00 בלבד.</p>}
      <div className="template-slots">
        {getAllowedSlots(activeDay).map(slot => {
          const selected = template[activeDay].has(slot);
          const isRangeStart = rangeStart === slot;
          return (
            <button key={slot} type="button"
              onClick={() => rangeStart === null && !selected ? setRangeStart(slot) : toggle(activeDay, slot)}
              onDoubleClick={() => { setRangeStart(null); toggle(activeDay, slot); }}
              className={`template-slot ${selected ? 'selected' : ''} ${isRangeStart ? 'range-start' : ''}`}>
              {slotToTime(slot)}
            </button>
          );
        })}
      </div>
      <button type="button" onClick={handleSave} disabled={loading} className="template-save-btn">
        {loading ? 'שומר...' : 'שמור זמינות'}
      </button>
    </div>
  );
}
