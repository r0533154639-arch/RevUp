import { Link } from 'react-router-dom';

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return (
    <nav>
      <Link to="/">RevUp</Link>
      {user ? (
        <>
          <Link to="/lessons">שיעורים</Link>
          <Link to="/test">טסט</Link>
          {user.role === 'instructor' && <Link to="/instructors">ניהול</Link>}
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
