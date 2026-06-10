export default function CalendarView({ lessons = [], onSelectDate }) {
  return (
    <div className="calendar-wrap">
      <input type="date" onChange={(e) => onSelectDate?.(e.target.value)} />
      <ul className="lessons-list">
        {lessons?.map((l) => (
          <li key={l.id} className="lesson-item">{l.date} {l.time} - {l.status}</li>
        ))}
      </ul>
    </div>
  );
}
