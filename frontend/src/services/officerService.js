import api from './api';

export const officerService = {
  getDashboardStats: async () => {
    const response = await api.get('/api/officer/dashboard/stats');
    return response.data;
  },

  getAllApplications: async () => {
    const response = await api.get('/api/officer/applications');
    return response.data;
  },

  triggerAiAnalysis: async (id) => {
    const response = await api.post(`/api/officer/applications/${id}/ai-analyze`);
    return response.data;
  },

  reviewApplication: async (id, reviewData) => {
    const response = await api.post(`/api/officer/applications/${id}/review`, reviewData);
    return response.data;
  },

  getAllCertificates: async () => {
    const response = await api.get('/api/officer/certificates');
    return response.data;
  },

  reviewCertificate: async (id, reviewData) => {
    const response = await api.post(`/api/officer/certificates/${id}/review`, reviewData);
    return response.data;
  },

  getAllGrievances: async () => {
    const response = await api.get('/api/officer/grievances');
    return response.data;
  },

  respondGrievance: async (id, responseData) => {
    const response = await api.post(`/api/officer/grievances/${id}/response`, responseData);
    return response.data;
  },

  getAllSuggestions: async () => {
    const response = await api.get('/api/officer/suggestions');
    return response.data;
  },

  reviewSuggestion: async (id, reviewData) => {
    const response = await api.post(`/api/officer/suggestions/${id}/status`, reviewData);
    return response.data;
  },

  getAllDevelopmentWorks: async () => {
    const response = await api.get('/api/officer/development-works');
    return response.data;
  },

  createDevelopmentWork: async (data) => {
    const response = await api.post('/api/officer/development-works', data);
    return response.data;
  },

  updateDevelopmentWork: async (id, data) => {
    const response = await api.put(`/api/officer/development-works/${id}`, data);
    return response.data;
  },

  getLatestBudget: async () => {
    const response = await api.get('/api/officer/budget');
    return response.data;
  },

  updateBudget: async (data) => {
    const response = await api.post('/api/officer/budget', data);
    return response.data;
  },
};
