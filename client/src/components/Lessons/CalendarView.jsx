export default function CalendarView({ lessons = [], onSelectDate }) {
  return (
    <div>
      <input type="date" onChange={(e) => onSelectDate?.(e.target.value)} />
      <ul>
        {lessons.map((l) => (
          <li key={l.id}>{l.date} {l.time} - {l.status}</li>
        ))}
      </ul>
    </div>
  );
}
