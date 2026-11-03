// Calls of the academy's Projects page (/project-submissions/admin routes).
// Academy admins get the projects of their academy, platform admins every one.
import { api } from '../lib/api';
import type { ReviewItem, ReviewPayload } from '../lib/project-reviews';

export const projectReviewsService = {
  // The projects waiting for a review, the oldest first
  pending: async (): Promise<ReviewItem[]> => {
    const response = await api.get<ReviewItem[]>('/project-submissions/admin/pending');
    return response.data;
  },

  // The last 100 reviews, the newest first
  reviewed: async (): Promise<ReviewItem[]> => {
    const response = await api.get<ReviewItem[]>('/project-submissions/admin/reviewed');
    return response.data;
  },

  // Approve, or ask for changes (feedback needed)
  review: async (id: string, payload: ReviewPayload): Promise<{ message: string; submission: ReviewItem }> => {
    const response = await api.patch<{ message: string; submission: ReviewItem }>(
      `/project-submissions/${encodeURIComponent(id)}/grade`,
      payload,
    );
    return response.data;
  },
};
