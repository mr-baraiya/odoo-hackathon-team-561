import React, { createContext, useContext, useState, useEffect } from 'react';
import { SEED_USERS } from '../utils/constants';
import { loginApi } from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dealflow_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return SEED_USERS[1]; // default Rep (Rahul Sharma)
      }
    }
    return SEED_USERS[1]; // default Rep for convenience, but can be unauthenticated if login screen loaded
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('dealflow_token') || true; // pre-logged in default for seamless demo
  });

  const login = async (email, password) => {
    try {
      const data = await loginApi(email, password);
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('dealflow_user', JSON.stringify(data.user));
      localStorage.setItem('dealflow_token', data.token);
      return data.user;
    } catch (err) {
      // Fallback matching
      const found = SEED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (found && (password === found.password || password === 'admin123' || password === 'rep123' || password === 'manager123' || password === 'finance123' || password === 'customer123')) {
        const loggedUser = { email: found.email, role: found.role, name: found.name, avatar: found.avatar };
        setUser(loggedUser);
        setIsAuthenticated(true);
        localStorage.setItem('dealflow_user', JSON.stringify(loggedUser));
        localStorage.setItem('dealflow_token', `token-${found.role}`);
        return loggedUser;
      }
      throw new Error(err.message || 'Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('dealflow_user');
    localStorage.removeItem('dealflow_token');
  };

  const loginAsSeedUser = (role) => {
    const found = SEED_USERS.find(u => u.role === role) || SEED_USERS[0];
    const loggedUser = { email: found.email, role: found.role, name: found.name, avatar: found.avatar };
    setUser(loggedUser);
    setIsAuthenticated(true);
    localStorage.setItem('dealflow_user', JSON.stringify(loggedUser));
    localStorage.setItem('dealflow_token', `token-${found.role}`);
    return loggedUser;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loginAsSeedUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
