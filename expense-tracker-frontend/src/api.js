// src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token (if available) before every request
API.interceptors.request.use(
  (req) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
      req.headers.Authorization = `Bearer ${user.token}`;
      console.log('🛡 JWT token attached');
    }
    return req;
  },
  (error) => {
    console.error('Request config error:', error);
    return Promise.reject(error);
  }
);

// Add response error logging & JWT expiry handling
API.interceptors.response.use(
  (res) => res,
  (error) => {
    const { config, response } = error;
    const status = response?.status;
    const errorMsg = response?.data?.message || '';

    console.error('🔴 AXIOS ERROR:', {
      method: config?.method,
      url: config?.url,
      status,
      message: error.message,
      response: response?.data,
    });

    // Handle expired JWT token
    if (errorMsg.includes('JWT expired')) {
      localStorage.removeItem('user');
      alert('⚠️ Session expired. Please log in again.');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.message === 'Network Error') {
      alert('⚠️ Backend not reachable. Make sure Spring Boot is running at http://localhost:8080/api');
    } else if (status === 404) {
      alert(`❌ API not found at ${config?.url}. Check your backend endpoint path.`);
    }

    return Promise.reject(error);
  }
);

// API functions
export const registerUser = (email, username, password) => {
  return API.post('/auth/register', { email, username, password });
};

export const loginUser = (email, password) => {
  return API.post('/auth/login', { email, password });
};

export default API;
