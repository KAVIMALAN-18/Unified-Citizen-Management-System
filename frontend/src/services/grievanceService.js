import api from './api';

export const grievanceService = {
  createGrievance: async (data) => {
    const response = await api.post('/api/citizen/grievances', data);
    return response.data;
  },

  getMyGrievances: async () => {
    const response = await api.get('/api/citizen/grievances');
    return response.data;
  },
};
