import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const STUDENT_LINKS = [
  { label: 'תאוריה', page: 'theory' },
  { label: 'שיעורים', page: 'lessons' },
  { label: 'טסט', page: 'test' },
  { label: 'חפש מורה', page: 'instructors' },
];

const INSTRUCTOR_LINKS = [
  { label: 'לוח זמנים', page: 'schedule' },
  { label: 'התלמידים שלי', page: 'students' },
  { label: 'הישגים', page: 'achievements' },
  { label: 'פוסטים', page: 'posts' },
];

const ADMIN_LINKS = [
  { label: 'תלמידים', page: 'admin-students' },
  { label: 'מורי נהיגה', page: 'admin-instructors' },
  { label: 'פוסטים', page: 'admin-posts' },
  { label: 'תגובות', page: 'admin-comments' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = user?.role === 'admin' ? ADMIN_LINKS : user?.role === 'instructor' ? INSTRUCTOR_LINKS : STUDENT_LINKS;

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to={user ? `/users/${user.id}/homePage` : '/'}>RevUp</Link>
        {user && links.map(({ label, page }) => (
          <Link key={page} to={`/users/${user.id}/${page}`}>{label}</Link>
        ))}
      </div>
      
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user.profile_image && (
            <img 
              src={`http://localhost:3000/uploads/${user.profile_image}`} 
              alt="פרופיל" 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                border: '2px solid #ddd'
              }} 
            />
          )}
          <span>שלום, {user.name}</span>
          <button onClick={handleLogout}>התנתקות</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/login">כניסה</Link>
          <Link to="/register">הרשמה</Link>
        </div>
      )}
    </nav>
  );
}
