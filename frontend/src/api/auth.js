import { apiRequest } from './client';

export const authApi = {
  login: (email, password) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => apiRequest('/api/auth/me'),

  updateProfile: (profileData) =>
    apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
};
