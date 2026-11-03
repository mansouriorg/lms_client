// The platform admin's Password resets page (/center/password-resets): the
// resets of the last 30 days (GET /auth/password-resets), what is left to do
// with each, and the link and message to send by hand.
// The file has no imports, so `pnpm test` can run it with Node directly.

export type ResetState = 'requested' | 'link-active' | 'link-expired' | 'used';

export type ResetUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  center: { name: string } | null;
};

// requestedAt is null for a reset a platform admin started
export type ResetRequest = {
  id: string;
  requestedAt: string | null;
  expiresAt: string | null;
  usedAt: string | null;
  createdAt: string;
  state: ResetState;
  user: ResetUser;
};

// The answer to a new link: its secret is only in this answer
export type CreatedLink = { message: string; token: string; expiresAt: string };

// A link is still to send: none yet, or the last one expired
export function needsLink(reset: Pick<ResetRequest, 'state'>): boolean {
  return reset.state === 'requested' || reset.state === 'link-expired';
}

// The resets to act on first, then the others (each in the order given)
export function splitResets(resets: ResetRequest[]): { todo: ResetRequest[]; others: ResetRequest[] } {
  return {
    todo: resets.filter((reset) => needsLink(reset)),
    others: resets.filter((reset) => needsLink(reset) === false),
  };
}

export function stateLabel(state: ResetState): string {
  if (state === 'requested') return 'Waiting for a link';
  if (state === 'link-active') return 'Link sent';
  if (state === 'link-expired') return 'Link expired';
  return 'Password changed';
}

// "Amira Ben Ali", or the email when the name is empty
export function userName(user: Pick<ResetUser, 'firstName' | 'lastName' | 'email'>): string {
  const name = `${user.firstName} ${user.lastName}`.trim();
  return name === '' ? user.email : name;
}

// The address the user opens: the reset page of this site, with the secret
export function resetLink(origin: string, token: string): string {
  return `${origin.replace(/\/+$/, '')}/auth/reset-password?token=${encodeURIComponent(token)}`;
}

// "until 2 Nov 2026, 19:51" (in the time zone of the browser, or the one given)
export function untilLabel(iso: string, timeZone?: string): string {
  const when = new Date(iso);
  if (Number.isNaN(when.getTime())) return '';
  const text = when.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  });
  return `until ${text}`;
}

// The message to paste in WhatsApp or an email, with the link
export function linkMessage(firstName: string, link: string, until: string): string {
  const hello = firstName.trim() === '' ? 'Hello,' : `Hello ${firstName.trim()},`;
  return `${hello} here is your link to choose a new password: ${link} It works once, ${until}. If you did not ask for it, ignore this message.`;
}
