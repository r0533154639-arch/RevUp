import { useState, useContext, createContext } from 'react';
import React from 'react';
import { login as loginService, register as registerService } from '../services/auth.service.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user'));
      if (!u?.id) { localStorage.removeItem('user'); localStorage.removeItem('token'); return null; }
      return u;
    } catch { return null; }
  });

  const login = async (data) => {
    const res = await loginService(data);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
    return res;
  };

  const register = async (data) => {
    const res = await registerService(data);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return React.createElement(AuthContext.Provider, { value: { user, login, register, logout } }, children);
};

export const useAuth = () => useContext(AuthContext);
