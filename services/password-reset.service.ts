// Calls of the forgotten password pages (no sign-in needed), and of the
// platform admin's Password resets page. The messages are readable as they are.
import { api } from '../lib/api';
import type { CreatedLink, ResetRequest } from '../lib/reset-requests';

export const passwordResetService = {
  // Always the same answer: the API does not tell who has an account
  forgot: async (email: string): Promise<string> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data.message;
  },

  // The new password, with the secret of the link (works once, 24 hours)
  reset: async (token: string, password: string): Promise<string> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', { token, password });
    return response.data.message;
  },

  // Platform admins: the resets of the last 30 days, the newest first
  list: async (): Promise<ResetRequest[]> => {
    const response = await api.get<ResetRequest[]>('/auth/password-resets');
    return response.data;
  },

  // Platform admins: a new one-time link for a reset (the earlier one stops
  // working). The secret is only in this answer.
  createLink: async (resetId: string): Promise<CreatedLink> => {
    const response = await api.post<CreatedLink>(`/auth/password-resets/${encodeURIComponent(resetId)}/link`);
    return response.data;
  },

  // Platform admins: a reset started for the account of an email, with its link
  createForEmail: async (email: string): Promise<CreatedLink> => {
    const response = await api.post<CreatedLink>('/auth/password-resets', { email });
    return response.data;
  },
};
