import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { getMyInstructor } from '../../services/stats.service.js';

const INSTRUCTOR_LINKS = [
  { label: 'לוח זמנים', page: 'schedule' },
  { label: 'התלמידים שלי', page: 'students' },
  { label: 'הישגים', page: 'achievements' },
  { label: 'פוסטים', page: 'posts' },
];

export default function Navbar() {
  const { user, logout, setInstructorId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'student' && user.instructor_id === undefined) {
      getMyInstructor()
        .then(({ instructor_id }) => setInstructorId(instructor_id))
        .catch(() => {});
    }
  }, [user?.id]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const studentLinks = [
    { label: 'תאוריה', page: 'theory' },
    { label: 'שיעורים', page: 'lessons' },
    { label: 'טסט', page: 'test' },
    ...(!user?.instructor_id ? [{ label: 'חפש מורה', page: 'instructors' }] : []),
  ];

  const links = user?.role === 'instructor' ? INSTRUCTOR_LINKS : studentLinks;

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
