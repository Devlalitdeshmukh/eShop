import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the token if available
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle global errors (like 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If we get a 401 and it's not the login attempt itself
      const isLoginRequest = error.config && error.config.url && error.config.url.includes('/auth/login');
      if (!isLoginRequest) {
        console.warn('Unauthorized access detected, clearing session.');
        localStorage.removeItem('userInfo');
        // Redirect to login page
        if (window.location.hash !== '#/login') {
            window.location.hash = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
