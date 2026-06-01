import { useState } from 'react';
import { login as loginService, register as registerService } from '../services/auth.service.js';

export const useAuth = () => {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } });

  const login = async (data) => {
    const res = await loginService(data);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
    return res;
  };

  const register = async (data) => registerService(data);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return { user, login, register, logout };
};
