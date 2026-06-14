import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

export default function OverrideSlotsEditor({ date, instructorId, value, onChange }) {
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
