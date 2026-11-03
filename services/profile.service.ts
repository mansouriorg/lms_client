// Calls to the /users/me routes: the signed-in user's own profile.
// lib/api.ts adds the sign-in token; the API only uses the user of the token.
import { api } from '../lib/api';
import type { Profile, ProfileValues } from '../lib/profile';

// POST /users/me/terms
export type AcceptedTerms = { message: string; termsVersion: string; termsAcceptedAt: string };

export type SavedProfile = {
  message: string;
  user: Pick<Profile, 'id' | 'email' | 'firstName' | 'lastName' | 'phone' | 'role'>;
};

export const profileService = {
  get: async (): Promise<Profile> => {
    const response = await api.get<Profile>('/users/me');
    return response.data;
  },

  // First name, last name and phone (an empty phone removes it)
  update: async (values: ProfileValues): Promise<SavedProfile> => {
    const response = await api.patch<SavedProfile>('/users/me', values);
    return response.data;
  },

  // Accepts the Terms of Service and the Privacy Policy, in the version the
  // pages show (LEGAL_UPDATED in lib/legal.ts); 400 when the API asks for
  // another one. Accepting again changes nothing.
  acceptTerms: async (termsVersion: string): Promise<AcceptedTerms> => {
    const response = await api.post<AcceptedTerms>('/users/me/terms', { acceptTerms: true, termsVersion });
    return response.data;
  },

  // POST /auth/change-password. The API checks the current password (400
  // when it is wrong) and allows 10 tries per minute. The sign-in tokens given
  // before stop working; the answer holds a new one for this browser.
  changePassword: async (passwords: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string; access_token?: string }> => {
    const response = await api.post<{ message: string; access_token?: string }>('/auth/change-password', passwords);
    return response.data;
  },

  // POST /auth/sign-out-others: the sign-in tokens of the other browsers and
  // devices stop working; the answer holds a new one for this browser.
  signOutOthers: async (): Promise<{ message: string; access_token: string }> => {
    const response = await api.post<{ message: string; access_token: string }>('/auth/sign-out-others');
    return response.data;
  },
};
