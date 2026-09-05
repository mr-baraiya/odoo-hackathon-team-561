import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.9.168:5000',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 4000
});

// Request interceptor to add authorization token if present
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('dealflow_user');
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
