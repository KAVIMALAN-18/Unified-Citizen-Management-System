import api from './api';

export const citizenService = {
  getProfile: async () => {
    const response = await api.get('/api/citizen/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/api/citizen/profile', profileData);
    return response.data;
  },
};
