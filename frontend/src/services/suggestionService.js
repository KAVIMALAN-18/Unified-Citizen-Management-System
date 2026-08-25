import api from './api';

export const suggestionService = {
  createSuggestion: async (data) => {
    const response = await api.post('/api/citizen/suggestions', data);
    return response.data;
  },

  getMySuggestions: async () => {
    const response = await api.get('/api/citizen/suggestions');
    return response.data;
  },
};
