import { useAuth } from '../../hooks/useAuth.js';
import DashboardCard from "./DashboardCards/DashboardCard.jsx";

const STUDENT_CARDS = [
  { title: 'לימודי תאוריה', description: 'חומרי לימוד ותרגול למבחן התאוריה', icon: '📖', page: 'theory' },
  { title: 'שיעורי נהיגה', description: 'צפה וקבע את השיעורים הקרובים שלך', icon: '🚗', page: 'lessons' },
  { title: 'טסט נהיגה', description: 'קבע טסט ועקוב אחר הסטטוס שלו', icon: '📋', page: 'test' },
  { title: 'פוסטים', description: 'קרא פוסטים ממורי נהיגה', icon: '✏️', page: 'posts' },
  { title: 'חפש מורה', description: 'מצא מורה נהיגה באזור שלך', icon: '🔍', page: 'instructors' },
];

const INSTRUCTOR_CARDS = [
  { title: 'לוח זמנים', description: 'צפה ועדכן את שיעורי הנהיגה הקרובים שלך', icon: '📅', page: 'schedule' },
  { title: 'התלמידים שלי', description: 'מעקב אחר התקדמות התלמידים שלך בדרך לרישיון', icon: '👥', page: 'students' },
  { title: 'הישגים', description: 'כמה שיעורים נעשו, אחוזי מעבר טסט ועוד', icon: '🏆', page: 'achievements' },
  { title: 'פוסטים', description: 'שתף תוכן מקצועי וצפה בפוסטים של מדריכים אחרים', icon: '✏️', page: 'posts' },
];

const ROLE_LABEL = { student: 'פאנל תלמיד', instructor: 'פאנל מורה', admin: 'פאנל מנהל' };

export default function HomePage({ user }) {
  const studentCards = user.role === 'student' && user.instructor_id
    ? STUDENT_CARDS.filter(c => c.page !== 'instructors')
    : STUDENT_CARDS;
  const adminCards = [
    ...STUDENT_CARDS,
    ...INSTRUCTOR_CARDS,
    { title: 'ניהול האתר', description: 'רשימת משתמשים, פוסטים, שיעורים וניהול הרשאות', icon: '⚙️', page: 'admin' },
  ];
  const cards = user.role === 'instructor' ? INSTRUCTOR_CARDS : user.role === 'admin' ? adminCards : studentCards;

  return (
    <div className="page-container">
      <div>
        <h3>שלום, {user.name} 👋</h3>
        <p>{ROLE_LABEL[user.role] || 'פאנל תלמיד'}</p>
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
