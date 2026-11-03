// Sign-in state in the browser.
//
// authService.login() saves the API token ("access_token") and the signed-in
// user ("user") in localStorage. The helpers below read them back and decide
// which area of the app an account belongs to: /center for academy and
// platform admins, /student for students.
//
// This only decides which pages to show. The API checks the token and the
// role on every request, so editing localStorage gives access to nothing.
// The file has no imports, so `pnpm test` can run it with Node directly.

export const TOKEN_KEY = 'access_token';
export const USER_KEY = 'user';
// Sent on `window` when this tab signs in or out. (The browser's "storage"
// event only reaches the other open tabs.)
export const AUTH_EVENT = 'lms-auth-change';

export type StoredUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export type Area = 'student' | 'center';

// The part of localStorage these helpers use (a plain object in the tests).
export type SessionStore = {
  getItem(key: string): string | null;
};

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

// The user saved at sign-in, or null when it is missing or not valid.
export function parseStoredUser(raw: string | null): StoredUser | null {
  if (raw === null || raw === '') return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof value !== 'object' || value === null) return null;
  const user = value as Record<string, unknown>;
  if (text(user.id) === '' || text(user.role) === '') return null;
  return {
    id: text(user.id),
    email: text(user.email),
    firstName: text(user.firstName),
    lastName: text(user.lastName),
    role: text(user.role),
  };
}

// When the token stops working, in milliseconds since 1970 (the "exp" field
// of the JWT), or null when it cannot be read. The API's tokens last 1 day.
export function tokenExpiresAt(token: string): number | null {
  const payload = token.split('.')[1];
  if (payload === undefined || payload === '') return null;
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const claims: unknown = JSON.parse(atob(padded));
    const exp = (claims as { exp?: unknown } | null)?.exp;
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

// The saved user as text, or '' when nobody is signed in or the token has
// expired. React compares this value between renders, so it is a string.
// When the expiry cannot be read, the user stays signed in and the API decides.
export function sessionSnapshot(store: SessionStore, now: number): string {
  const token = store.getItem(TOKEN_KEY);
  const user = store.getItem(USER_KEY);
  if (token === null || token === '' || user === null) return '';
  const expiresAt = tokenExpiresAt(token);
  if (expiresAt !== null && expiresAt <= now) return '';
  return user;
}

// Roles come from the Role enum of the API (server/prisma/schema.prisma).
export function areaOf(role: string): Area {
  return role === 'CENTER_ADMIN' || role === 'SUPER_ADMIN' ? 'center' : 'student';
}

export function homePathFor(role: string): string {
  return areaOf(role) === 'center' ? '/center/dashboard' : '/student/dashboard';
}

// The sign-in page, with the page to come back to afterwards.
export function loginPathFor(currentPath: string): string {
  return `/auth/login?next=${encodeURIComponent(currentPath)}`;
}

// Where to go after signing in. `next` is the page the visitor tried to open
// (from /auth/login?next=...). It is used only when it is a plain page of
// their own area (students may also come back to a checkout page), so a
// crafted link cannot send them to another site.
export function afterSignInPath(role: string, next: string | null): string {
  const target = next ?? '';
  const allowed = areaOf(role) === 'center' ? ['/center/'] : ['/student/', '/checkout/'];
  if (allowed.some((start) => target.startsWith(start)) && /^[A-Za-z0-9/_-]+$/.test(target)) {
    return target;
  }
  return homePathFor(role);
}

export function displayName(user: StoredUser): string {
  const name = `${user.firstName} ${user.lastName}`.trim();
  return name === '' ? user.email : name;
}

export function initials(user: StoredUser): string {
  const letters = [user.firstName, user.lastName]
    .map((part) => part.trim().charAt(0))
    .join('');
  return (letters === '' ? user.email.charAt(0) : letters).toUpperCase();
}

export function roleLabel(role: string): string {
  if (role === 'SUPER_ADMIN') return 'Platform admin';
  if (role === 'CENTER_ADMIN') return 'Academy admin';
  return 'Student';
}

// The saved user, brought up to date with the account the API sees now
// (GET /users/me) when its role, email or names changed since sign-in: an
// academy admin added or removed, a platform admin made from the terminal.
// null when nothing changed, or when `current` is another account.
export function refreshedUser(stored: StoredUser, current: StoredUser): StoredUser | null {
  if (current.id !== stored.id) return null;
  const next: StoredUser = {
    id: stored.id,
    email: current.email,
    firstName: current.firstName,
    lastName: current.lastName,
    role: current.role,
  };
  const same =
    next.email === stored.email &&
    next.firstName === stored.firstName &&
    next.lastName === stored.lastName &&
    next.role === stored.role;
  return same ? null : next;
}
