// Calls to the /auth routes of the API.
// login() saves the token and the user in localStorage (keys in lib/auth.ts),
// so lib/api.ts sends the token with every request; logout() removes them.
// Both tell the open pages, so the /student and /center layouts update at once.
import { api } from '../lib/api';
import { AUTH_EVENT, TOKEN_KEY, USER_KEY, type StoredUser, parseStoredUser } from '../lib/auth';

// The fields of the API's RegisterDto (the password needs 8 characters).
// acceptTerms is the sign-up checkbox, termsVersion the date of the Terms of
// Service and Privacy Policy the page showed (LEGAL_UPDATED in lib/legal.ts).
export type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  termsVersion: string;
};

export type Credentials = {
  email: string;
  password: string;
};

export type RegisterResponse = {
  message: string;
  user: StoredUser & { createdAt: string };
};

export type LoginResponse = {
  message: string;
  access_token: string;
  user: StoredUser;
};

function announceChange() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export const authService = {
  // Creates the account. The API does not sign in here: call login() next.
  register: async (input: RegisterInput): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', input);
    return response.data;
  },

  login: async (credentials: Credentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem(TOKEN_KEY, response.data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      announceChange();
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    announceChange();
  },

  // After the profile is saved (Settings), or when the API sees another role
  // or other names (lib/use-session.ts): the saved user changes, so the
  // sidebar, the greeting and the area shown follow at once. Nothing happens
  // when nobody is signed in, or when `changes.id` is another account.
  updateStoredUser: (changes: Partial<StoredUser>) => {
    const user = parseStoredUser(localStorage.getItem(USER_KEY));
    if (user === null) return;
    if (changes.id !== undefined && changes.id !== user.id) return;
    localStorage.setItem(USER_KEY, JSON.stringify({ ...user, ...changes }));
    announceChange();
  },

  // After a password change: the new token of this browser (the API refuses
  // the ones given before). Nothing happens when nobody is signed in.
  replaceToken: (token: string) => {
    if (parseStoredUser(localStorage.getItem(USER_KEY)) === null || token === '') return;
    localStorage.setItem(TOKEN_KEY, token);
    announceChange();
  },

  // The session the API sees for the current token (401 when it has expired).
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
