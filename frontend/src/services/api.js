import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Authorization Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    try {
      const session = localStorage.getItem('dealflow_session');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      }
    } catch (e) {
      console.error('Error reading token for API request', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Service Endpoints
export const loginApi = (email, password) => {
  return api.post('/auth/login', { email, password });
};

// Admin User Management Endpoints
export const getUsersApi = () => {
  return api.get('/admin/users');
};

export const createUserApi = (userData) => {
  return api.post('/admin/users', userData);
};

export const updateUserApi = (id, userData) => {
  return api.put(`/admin/users/${id}`, userData);
};

export const deactivateUserApi = (id) => {
  return api.patch(`/admin/users/${id}/deactivate`);
};

export const activateUserApi = (id) => {
  return api.patch(`/admin/users/${id}/activate`);
};

export default api;
