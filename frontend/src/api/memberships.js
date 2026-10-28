import { apiRequest } from './client';

export const membershipsApi = {
  requestMembership: (club_id, message = '') =>
    apiRequest('/api/memberships', {
      method: 'POST',
      body: JSON.stringify({ club_id, message }),
    }),

  getMyMemberships: () => apiRequest('/api/memberships/me'),

  cancelMembership: (membership_id) =>
    apiRequest(`/api/memberships/${membership_id}`, {
      method: 'DELETE',
    }),
};
