import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(form);
    navigate('/lessons');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>כניסה</h2>
      <input type="email" placeholder="אימייל" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <input type="password" placeholder="סיסמה" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      <button type="submit">כניסה</button>
    </form>
  );
}
