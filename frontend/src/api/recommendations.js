import { apiRequest } from './client';

export const recommendationsApi = {
  getRecommendations: (data = {}) =>
    apiRequest('/api/recommendations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getHistory: () => apiRequest('/api/recommendations/history'),
};
