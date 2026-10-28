import { apiRequest } from './client';

export const favoritesApi = {
  getFavorites: () => apiRequest('/api/favorites'),

  addFavorite: (club_id) =>
    apiRequest(`/api/favorites/${club_id}`, {
      method: 'POST',
    }),

  removeFavorite: (club_id) =>
    apiRequest(`/api/favorites/${club_id}`, {
      method: 'DELETE',
    }),
};
