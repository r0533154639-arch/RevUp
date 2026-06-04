
import DashboardCard from "./DashboardCards/DashboardCard.jsx";
export default function HomePage({ user }) {
  return (
    <div className="page-container">
      <div>
        <h3>Hi, {user.name}</h3>
        <p>Home Page</p>
      </div>
      <div className="dashboard-cards-container">
        <DashboardCard
          title="התלמידים שלי"
          description="מעקב אחר התקדמות התלמידים שלך בדרך לרישיון"
          icon="👥"
          linkTo="/students-tracking"
        />
        <DashboardCard
          title="לוח זמנים"
          description="צפה ועדכן את שיעורי הנהיגה הקרובים שלך"
          icon="📅"
          linkTo="/schedule"
        />
        <DashboardCard
          title="פוסטים"
          description="שתף תוכן מקצועי וצפה בפוסטים של מדריכים אחרים"
          icon="✏️"
          linkTo="/posts"
        />
        <DashboardCard
          title="הישגים"
          description="עקוב אחר ההצלחות שלך ושל תלמידיך"
          icon="🏆"
          linkTo="/achievements"
        />
      </div>
    </div>
  );
}
