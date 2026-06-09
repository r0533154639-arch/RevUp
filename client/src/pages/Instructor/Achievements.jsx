import { useState, useEffect } from 'react';
import { getAchievements } from '../../services/stats.service.js';

const StatCard = ({ icon, label, value, sub }) => (
  <div className="achievement-card">
    <span className="achievement-icon">{icon}</span>
    <span className="achievement-value">{value ?? '—'}</span>
    <span className="achievement-label">{label}</span>
    {sub && <span className="achievement-sub">{sub}</span>}
  </div>
);

export default function Achievements() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAchievements()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><p>טוען...</p></div>;
  if (!stats) return <div className="page-container"><p>שגיאה בטעינת הנתונים</p></div>;

  const licenseRate = stats?.total_students
    ? Math.round((stats.licensed_students / stats.total_students) * 100)
    : 0;

  return (
    <div className="page-container achievements-page">
      <h2>🏆 הישגים</h2>
      <p className="achievements-sub">סטטיסטיקות כלליות על הפעילות שלך</p>

      <div className="achievements-grid">
        <StatCard icon="👨‍🎓" label="תלמידים פעילים" value={stats?.total_students} />
        <StatCard icon="🪪" label="קיבלו רישיון" value={stats?.licensed_students} sub={`${licenseRate}% מהתלמידים`} />
        <StatCard icon="🚗" label="שיעורים שנלמדו" value={stats?.completed_lessons} sub={`מתוך ${stats?.total_lessons ?? 0} שנקבעו`} />
        <StatCard icon="📊" label="אחוז השלמה" value={stats?.completion_rate != null ? `${stats.completion_rate}%` : '—'} />
        <StatCard icon="⭐" label="דירוג ממוצע" value={stats?.avg_rating ?? '—'} sub={`${stats?.total_reviews ?? 0} ביקורות`} />
      </div>

      {stats?.licensed_students > 0 && (
        <div className="achievement-badge">
          🎉 כבר {stats.licensed_students} תלמידים שלך קיבלו רישיון!
        </div>
      )}
    </div>
  );
}
