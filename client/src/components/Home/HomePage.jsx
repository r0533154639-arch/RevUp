import { useAuth } from '../../hooks/useAuth.js';
import DashboardCard from "./DashboardCards/DashboardCard.jsx";

const STUDENT_CARDS = [
  { title: 'לימודי תאוריה', description: 'חומרי לימוד ותרגול למבחן התאוריה', icon: '📖', page: 'theory' },
  { title: 'שיעורי נהיגה', description: 'צפה וקבע את השיעורים הקרובים שלך', icon: '🚗', page: 'lessons' },
  { title: 'טסט נהיגה', description: 'קבע טסט ועקוב אחר הסטטוס שלו', icon: '📋', page: 'test' },
  { title: 'חפש מורה', description: 'מצא מורה נהיגה באזור שלך', icon: '🔍', page: 'instructors' },
];

const INSTRUCTOR_CARDS = [
  { title: 'לוח זמנים', description: 'צפה ועדכן את שיעורי הנהיגה הקרובים שלך', icon: '📅', page: 'schedule' },
  { title: 'פוסטים', description: 'שתף תוכן מקצועי וצפה בפוסטים של מדריכים אחרים', icon: '✏️', page: 'posts' },
];

export default function HomePage({ user }) {
  const cards = user.role === 'instructor' ? INSTRUCTOR_CARDS : STUDENT_CARDS;

  return (
    <div className="page-container">
      <div>
        <h3>שלום, {user.name} 👋</h3>
        <p>{user.role === 'instructor' ? 'פאנל מורה' : 'פאנל תלמיד'}</p>
      </div>
      <div className="dashboard-cards-container">
        {cards.map(card => (
          <DashboardCard
            key={card.page}
            title={card.title}
            description={card.description}
            icon={card.icon}
            linkTo={`/users/${user.id}/${card.page}`}
          />
        ))}
      </div>
    </div>
  );
}
