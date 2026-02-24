// frontend/src/services/auth.service.ts
import { api } from '../lib/api';

export const authService = {
  // 1. Register a new user
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // 2. Login and save the token
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    
    // Save the token to local storage so the interceptor can find it
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // 3. Log out by destroying the token
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    // Usually, you redirect the user to the login page here
  },

  // 4. Test your protected route
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};