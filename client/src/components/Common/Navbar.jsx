import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/">RevUp</Link>
      {user ? (
        <>
          <Link to={`/users/${user.id}/theory`}>לימודי תאוריה</Link>
          <Link to={`/users/${user.id}/lessons`}>שיעורים</Link>
          <Link to={`/users/${user.id}/test`}>טסט</Link>
          {user.role === 'instructor' && <Link to={`/users/${user.id}/instructors`}>ניהול</Link>}
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
