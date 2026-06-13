import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(form);
      const { user } = res;
      if (user.role === 'instructor' && user.profile_status === 'draft') {
        navigate(`/users/${user.id}/completeProfile`);
      } else {
        navigate(`/users/${user.id}/homePage`);
      }
    } catch {
      setError('פרטי הכניסה שגויים, אנא נסה שנית');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>כניסה</h2>
      <input type="email" placeholder="אימייל" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <input type="password" placeholder="סיסמה" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      {error && <span className="error-msg">{error}</span>}
      <button type="submit">כניסה</button>
      <p>אין לך חשבון? <Link to="/register">הרשמה</Link></p>
    </form>
  );
}
