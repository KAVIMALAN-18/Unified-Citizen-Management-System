import api from './api';

export const certificateService = {
  createRequest: async (data) => {
    const response = await api.post('/api/citizen/certificates', data);
    return response.data;
  },

  getMyRequests: async () => {
    const response = await api.get('/api/citizen/certificates');
    return response.data;
  },

  downloadCertificate: async (id) => {
    const response = await api.get(`/api/citizen/certificates/${id}/download`, {
      responseType: 'text',
    });
    return response.data;
  },
};
