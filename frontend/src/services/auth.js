import api from './api';
import { SEED_USERS } from '../utils/constants';

export const loginApi = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  } catch (err) {
    console.warn('API unavailable, falling back to seed authentication logic');
    const matched = SEED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (matched) {
      return {
        user: { email: matched.email, role: matched.role, name: matched.name, avatar: matched.avatar },
        token: `mock-token-${matched.role}-${Date.now()}`
      };
    }
    throw new Error('Invalid email or password');
  }
};
