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

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = user?.role === 'instructor' ? INSTRUCTOR_LINKS : STUDENT_LINKS;

  return (
    <nav>
      <Link to={user ? `/users/${user.id}/homePage` : '/'}>RevUp</Link>
      {user ? (
        <>
          {links.map(({ label, page }) => (
            <Link key={page} to={`/users/${user.id}/${page}`}>{label}</Link>
          ))}
          <button onClick={handleLogout} style={{ marginRight: 'auto' }}>התנתקות</button>
        </>
      ) : (
        <>
          <Link to="/login">כניסה</Link>
          <Link to="/register">הרשמה</Link>
        </>
      )}
    </nav>
  );
}
