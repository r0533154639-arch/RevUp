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

  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = async (data) => {
    const res = await loginService(data);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const register = async (data) => {
    const res = await registerService(data);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const updateUser = (userData) => {
    const current = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...current, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const refreshUser = async () => {
    try {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) return;
      const response = await fetch('http://localhost:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return React.createElement(AuthContext.Provider, { value: { user, token, login, register, logout, updateUser, refreshUser } }, children);
};

export const useAuth = () => useContext(AuthContext);
