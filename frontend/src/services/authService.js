import api from './api';

export const authService = {
  registerCitizen: async (data) => {
    const response = await api.post('/api/auth/citizen/register', data);
    return response.data;
  },

  loginCitizen: async (data) => {
    const response = await api.post('/api/auth/citizen/login', data);
    return response.data;
  },

  loginOfficer: async (data) => {
    const response = await api.post('/api/auth/officer/login', data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};
