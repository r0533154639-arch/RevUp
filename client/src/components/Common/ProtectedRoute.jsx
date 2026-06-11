import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth();
  const { username, page } = useParams();
  if (!user) return <Navigate to="/login" />;
  if (username && String(username) !== String(user.id)) {
    return <Navigate to={`/users/${user.id}/${page || 'homePage'}`} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
}
