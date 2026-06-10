export default function ProgressBar({ completed, total }) {
  const pct = total ? Math.round((completed / total) * 100) : 0;
  return (
    <div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="progress-bar-label">{completed}/{total} שיעורים ({pct}%)</p>
    </div>
  );
}
