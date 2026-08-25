import api from './api';

export const applicationService = {
  createApplication: async (data) => {
    const response = await api.post('/api/citizen/applications', data);
    return response.data;
  },

  getMyApplications: async () => {
    const response = await api.get('/api/citizen/applications');
    return response.data;
  },

  getApplicationDetails: async (id) => {
    const response = await api.get(`/api/citizen/applications/${id}`);
    return response.data;
  },

  uploadDocument: async (id, documentType, fileName, filePath) => {
    const params = new URLSearchParams({ documentType, fileName, filePath });
    const response = await api.post(`/api/citizen/applications/${id}/documents?${params.toString()}`);
    return response.data;
  },
};
