import { apiRequest } from './client';

export const clubsApi = {
  getClubs: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.interest) query.append('interest', params.interest);
    if (params.skip) query.append('skip', params.skip);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString();
    return apiRequest(`/api/clubs${queryString ? `?${queryString}` : ''}`);
  },

  getClubById: (id) => apiRequest(`/api/clubs/${id}`),

  getCategories: () => apiRequest('/api/clubs/categories/list'),

  getAllInterests: () => apiRequest('/api/clubs/interests/list'),
};
