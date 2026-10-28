import { apiRequest } from './client';

export const feedbackApi = {
  submitFeedback: (club_id, rating, feedback_type = 'helpful', comment = '') =>
    apiRequest('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({ club_id, rating, feedback_type, comment }),
    }),

  getMyFeedback: () => apiRequest('/api/feedback/me'),
};
