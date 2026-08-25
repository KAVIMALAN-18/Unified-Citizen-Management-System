import api from './api';

export const schemeService = {
  getAllSchemes: async () => {
    const response = await api.get('/api/schemes');
    return response.data;
  },

  getSchemeById: async (schemeId) => {
    const response = await api.get(`/api/schemes/${schemeId}`);
    return response.data;
  },
};
