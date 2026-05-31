export default function ProgressBar({ completed, total }) {
  const pct = total ? Math.round((completed / total) * 100) : 0;
  return (
    <div style={{ background: '#eee', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, background: '#4caf50', height: 12, transition: 'width 0.3s' }} />
      <span>{completed}/{total} שיעורים ({pct}%)</span>
    </div>
  );
}
