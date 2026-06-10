import { useState } from 'react';
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
  { label: 'תלמידים', page: 'students' },
  { label: 'שיעורים', page: 'lessons' },
  { label: 'לוח זמנים', page: 'schedule' },
  { label: 'מורים', page: 'instructors' },
  { label: 'פוסטים', page: 'posts' },
  { label: 'טסטים', page: 'test' },
  { label: 'הישגים', page: 'achievements' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = user?.role === 'admin' ? ADMIN_LINKS : user?.role === 'instructor' ? INSTRUCTOR_LINKS : STUDENT_LINKS;

  return (
    <nav>
      <Link to={user ? `/users/${user.id}/homePage` : '/'}>RevUp</Link>

      <div className="nav-links">
        {user && links.map(({ label, page }) => (
          <Link key={page} to={`/users/${user.id}/${page}`}>{label}</Link>
        ))}
      </div>

      {user ? (
        <div className="nav-profile">
          <div className="nav-profile-trigger" onClick={() => setMenuOpen(o => !o)}>
            {user.profile_image
              ? <img src={`http://localhost:3000/uploads/${user.profile_image}`} alt="פרופיל" className="nav-avatar" />
              : <div className="nav-avatar-placeholder">{user.name?.[0]}</div>
            }
            <span className="nav-username">{user.name}</span>
          </div>
          {menuOpen && (
            <div className="nav-dropdown">
              <button onClick={handleLogout}>התנתקות</button>
            </div>
          )}
        </div>
      ) : (
        <div className="nav-auth-links">
          <Link to="/login">כניסה</Link>
          <Link to="/register">הרשמה</Link>
        </div>
      )}
    </nav>
  );
}