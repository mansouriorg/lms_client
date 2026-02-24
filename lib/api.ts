// frontend/src/lib/api.ts
import axios from 'axios';

// Point this to your NestJS backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach the Bearer token
api.interceptors.request.use(
  (config) => {
    // If you are on React Native, you would use AsyncStorage or SecureStore here instead
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);