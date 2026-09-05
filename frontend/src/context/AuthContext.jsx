import React, { createContext, useContext, useState, useEffect } from 'react';
import { SEED_USERS } from '../utils/constants';
import { loginApi, getUsersApi, createUserApi } from '../services/api';

const AuthContext = createContext();
const SESSION_KEY = 'dealflow_session';
const ADMIN_CREATED_USERS_KEY = 'dealflow_admin_created_users';

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

  // Helper to normalize backend role strings
  const normalizeRole = (roleStr) => {
    if (!roleStr) return 'rep';
    const r = roleStr.toLowerCase();
    if (r === 'sales_rep' || r === 'rep') return 'rep';
    if (r === 'sales_manager' || r === 'manager') return 'manager';
    if (r === 'finance_ops' || r === 'finance') return 'finance';
    if (r === 'admin' || r === 'administrator') return 'admin';
    if (r === 'customer' || r === 'client') return 'customer';
    return r;
  };

  const getAdminCreatedUsers = () => {
    try {
      const saved = localStorage.getItem(ADMIN_CREATED_USERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  const createSession = (userData, customToken = null) => {
    const role = normalizeRole(userData.role);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const newSession = {
      user: {
        id: userData.id || `user_${Date.now()}`,
        name: userData.name || userData.full_name || 'User',
        email: userData.email,
        phone: userData.phone || '',
        role: role,
        avatar: userData.avatar || (userData.name || userData.full_name || 'US').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        isActive: userData.isActive !== undefined ? userData.isActive : true
      },
      token: customToken || `jwt_token_${Date.now()}`,
      expiresAt,
      permissions: getPermissionsForRole(role)
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

    // 1. Try Backend API login
    try {
      const response = await loginApi(cleanEmail, password);
      if (response.data && response.data.token) {
        return createSession(response.data.user || { email: cleanEmail, role: response.data.role }, response.data.token);
      }
    } catch (apiErr) {
      console.warn('Backend API server unreachable or login failed on server. Falling back to local seed accounts.', apiErr?.message);
    }

    // 2. Fallback to Seed Users & Admin Created Users
    const localCreated = getAdminCreatedUsers();
    const allUsers = [...SEED_USERS, ...localCreated];
    const found = allUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      throw new Error('No user found with this email address. Contact System Administrator for access.');
    }

    if (found.password !== password) {
      throw new Error('Incorrect password. Please verify your login credentials.');
    }

    if (found.isActive === false) {
      throw new Error('Account deactivated. Please contact your System Administrator.');
    }

    return createSession(found);
  };

  // Admin-only User Creation
  const createUser = async (userData) => {
    const cleanEmail = userData.email.trim().toLowerCase();
    const role = normalizeRole(userData.role);
    const localCreated = getAdminCreatedUsers();
    const allUsers = [...SEED_USERS, ...localCreated];

    if (allUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('A user with this email address already exists.');
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name: userData.name.trim(),
      email: cleanEmail,
      phone: userData.phone || '',
      password: userData.password || 'TempPass123',
      role: role,
      avatar: userData.name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // Try posting to API if online
    try {
      await createUserApi(newUser);
    } catch (apiErr) {
      console.warn('Backend API unreachable for createUser, saving locally.', apiErr?.message);
    }

    const updated = [...localCreated, newUser];
    localStorage.setItem(ADMIN_CREATED_USERS_KEY, JSON.stringify(updated));
    return newUser;
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAuthenticated, login, createUser, logout, getAdminCreatedUsers }}>
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
