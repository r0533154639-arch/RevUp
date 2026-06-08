import { useAuth } from '../../hooks/useAuth.js';
import DashboardCard from "./DashboardCards/DashboardCard.jsx";

const STUDENT_CARDS = [
  { title: 'לימודי תאוריה', description: 'חומרי לימוד ותרגול למבחן התאוריה', icon: '📖', page: 'theory' },
  { title: 'שיעורי נהיגה', description: 'צפה וקבע את השיעורים הקרובים שלך', icon: '🚗', page: 'lessons' },
  { title: 'טסט נהיגה', description: 'קבע טסט ועקוב אחר הסטטוס שלו', icon: '📋', page: 'test' },
  { title: 'חפש מורה', description: 'מצא מורה נהיגה באזור שלך', icon: '🔍', page: 'instructors' },
];

const ADMIN_CARDS = [
  { title: 'תלמידים', description: 'צפייה בכל התלמידים והתקדמותם', icon: '👥', page: 'students' },
  { title: 'שיעורים', description: 'צפייה בכל שיעורי הנהיגה', icon: '🚗', page: 'lessons' },
  { title: 'לוח זמנים', description: 'צפייה בלוח הזמנים הכללי', icon: '📅', page: 'schedule' },
  { title: 'מורים', description: 'רשימת כל מורי הנהיגה', icon: '👨‍🏫', page: 'instructors' },
  { title: 'פוסטים', description: 'צפייה וניהול פוסטים', icon: '✏️', page: 'posts' },
  { title: 'טסטים', description: 'צפייה בכל הטסטים', icon: '📋', page: 'test' },
  { title: 'הישגים', description: 'סטטיסטיקות כלליות', icon: '🏆', page: 'achievements' },
];

const INSTRUCTOR_CARDS = [
  { title: 'לוח זמנים', description: 'צפה ועדכן את שיעורי הנהיגה הקרובים שלך', icon: '📅', page: 'schedule' },
  { title: 'התלמידים שלי', description: 'מעקב אחר התקדמות התלמידים שלך בדרך לרישיון', icon: '👥', page: 'students' },
  { title: 'הישגים', description: 'כמה שיעורים נעשו, אחוזי מעבר טסט ועוד', icon: '🏆', page: 'achievements' },
  { title: 'פוסטים', description: 'שתף תוכן מקצועי וצפה בפוסטים של מדריכים אחרים', icon: '✏️', page: 'posts' },
];

export default function HomePage({ user }) {
  const cards = user.role === 'admin' ? ADMIN_CARDS : user.role === 'instructor' ? INSTRUCTOR_CARDS : STUDENT_CARDS;
  const panelLabel = user.role === 'admin' ? 'פאנל אדמין' : user.role === 'instructor' ? 'פאנל מורה' : 'פאנל תלמיד';

  return (
    <div className="page-container">
      <div>
        <h3>שלום, {user.name} 👋</h3>
        <p>{panelLabel}</p>
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
