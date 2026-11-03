'use client';

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { profileService } from '@/services/profile.service';
import { apiStatus } from './api-error';
import {
  AUTH_EVENT,
  type Area,
  type StoredUser,
  areaOf,
  homePathFor,
  loginPathFor,
  parseStoredUser,
  refreshedUser,
  sessionSnapshot,
} from './auth';

// Re-read the sign-in state when this tab signs in or out (AUTH_EVENT) or
// when another tab does (the browser's "storage" event).
function subscribe(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  window.addEventListener(AUTH_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(AUTH_EVENT, onChange);
  };
}

function readSnapshot(): string {
  return sessionSnapshot(window.localStorage, Date.now());
}

// On the server, and while the page loads, nobody is known yet.
function readServerSnapshot(): null {
  return null;
}

// Who is signed in, for pages anyone can open (the checkout page).
// `known` is false on the server and while the page loads; then `user` is
// the signed-in user, or null when nobody is signed in (or the token expired).
export function useSession(): { known: boolean; user: StoredUser | null } {
  const snapshot = useSyncExternalStore<string | null>(
    subscribe,
    readSnapshot,
    readServerSnapshot,
  );
  const user = useMemo(
    () => (snapshot === null ? null : parseStoredUser(snapshot)),
    [snapshot],
  );
  return { known: snapshot !== null, user };
}

// For the layouts of /student and /center.
// - `user` is the signed-in user once it is known and belongs to `area`;
//   until then it is null and the layout shows a loading screen.
// - Signed-out visitors (or an expired token) go to the sign-in page, and
//   come back to this page after signing in.
// - Accounts of the other area go to their own dashboard.
// - Once per page load, the account is read again (GET /users/me): a role
//   given or taken away since sign-in opens the right area at once, and a
//   sign-in the API no longer accepts (401: deleted account) signs out.
// - `signOut` removes the token and goes to the sign-in page.
export function useAreaSession(area: Area): {
  user: StoredUser | null;
  signOut: () => void;
} {
  const router = useRouter();
  const { known, user } = useSession();
  const signingOut = useRef(false);
  // The account already read again on this page load
  const checkedFor = useRef<string | null>(null);

  useEffect(() => {
    if (known === false) return;
    if (user === null) {
      router.replace(
        signingOut.current ? '/auth/login' : loginPathFor(window.location.pathname),
      );
      return;
    }
    if (areaOf(user.role) !== area) router.replace(homePathFor(user.role));
  }, [known, user, area, router]);

  useEffect(() => {
    if (user === null || checkedFor.current === user.id) return;
    checkedFor.current = user.id;
    profileService.get().then(
      (profile) => {
        const changed = refreshedUser(user, profile);
        if (changed !== null) authService.updateStoredUser(changed);
      },
      (error: unknown) => {
        // Not when the server cannot be reached: the pages say so themselves
        if (apiStatus(error) === 401) authService.logout();
      },
    );
  }, [user]);

  const signOut = useCallback(() => {
    signingOut.current = true;
    authService.logout();
  }, []);

  const allowed = user !== null && areaOf(user.role) === area;
  return { user: allowed ? user : null, signOut };
}
