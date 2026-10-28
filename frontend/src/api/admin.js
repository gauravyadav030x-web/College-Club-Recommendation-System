import { apiRequest } from './client';

export const adminApi = {
  getStats: () => apiRequest('/api/admin/stats'),

  getStudents: () => apiRequest('/api/admin/students'),

  createClub: (clubData) =>
    apiRequest('/api/admin/clubs', {
      method: 'POST',
      body: JSON.stringify(clubData),
    }),

  updateClub: (club_id, clubData) =>
    apiRequest(`/api/admin/clubs/${club_id}`, {
      method: 'PATCH',
      body: JSON.stringify(clubData),
    }),

  deleteClub: (club_id, hardDelete = false) =>
    apiRequest(`/api/admin/clubs/${club_id}?hard_delete=${hardDelete}`, {
      method: 'DELETE',
    }),

  getMemberships: (statusFilter) => {
    const url = statusFilter
      ? `/api/admin/memberships?status_filter=${statusFilter}`
      : '/api/admin/memberships';
    return apiRequest(url);
  },

  reviewMembership: (membership_id, status) =>
    apiRequest(`/api/admin/memberships/${membership_id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  createInterest: (interestData) =>
    apiRequest('/api/admin/interests', {
      method: 'POST',
      body: JSON.stringify(interestData),
    }),

  deleteInterest: (interest_id) =>
    apiRequest(`/api/admin/interests/${interest_id}`, {
      method: 'DELETE',
    }),
};
