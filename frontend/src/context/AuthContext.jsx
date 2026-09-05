import React, { createContext, useContext, useState, useEffect } from 'react';
import { SEED_USERS } from '../utils/constants';

const AuthContext = createContext();
const SESSION_KEY = 'dealflow_session';
const REGISTERED_USERS_KEY = 'dealflow_registered_users';

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse session from localStorage', e);
    }
    localStorage.removeItem(SESSION_KEY);
    return null;
  });

  const user = session?.user || null;
  const isAuthenticated = !!(session && new Date(session.expiresAt) > new Date());

  const getRegisteredUsers = () => {
    try {
      const saved = localStorage.getItem(REGISTERED_USERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  const createSession = (userData) => {
    // 24 hours expiry
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const newSession = {
      user: {
        id: userData.id || `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'rep',
        avatar: userData.avatar || userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      },
      token: `jwt_token_${Date.now()}`,
      expiresAt,
      permissions: getPermissionsForRole(userData.role)
    };

    setSession(newSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    return newSession;
  };

  const getPermissionsForRole = (role) => {
    switch (role) {
      case 'admin':
        return ['all'];
      case 'manager':
        return ['view_team_quotes', 'approve_quotes', 'view_reports'];
      case 'finance':
        return ['view_financials', 'manage_invoices', 'view_high_risk'];
      case 'customer':
        return ['view_own_quotes', 'browse_products'];
      case 'rep':
      default:
        return ['create_quotes', 'view_own_quotes'];
    }
  };

  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const registered = getRegisteredUsers();
    const allUsers = [...SEED_USERS, ...registered];

    const found = allUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      throw new Error('No user found with this email address.');
    }

    if (found.password !== password) {
      throw new Error('Incorrect password. Please check your credentials.');
    }

    return createSession(found);
  };

  const signup = async ({ name, email, password, role }) => {
    const cleanEmail = email.trim().toLowerCase();
    const registered = getRegisteredUsers();
    const allUsers = [...SEED_USERS, ...registered];

    if (allUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password,
      role: role || 'rep',
      avatar: name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    };

    const updated = [...registered, newUser];
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated));

    return createSession(newUser);
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAuthenticated, login, signup, logout }}>
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
