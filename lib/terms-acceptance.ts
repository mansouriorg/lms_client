// The notice of the signed-in spaces (components/account/TermsNotice.tsx):
// shown while the account has not accepted the current version of the Terms
// of Service and the Privacy Policy (termsVersion of GET /users/me).
// The file has no imports, so `pnpm test` can run it with Node directly.

export type TermsNoticeText = { title: string; text: string };

// "1 November 2026" for the version "2026-11-01"; '' for anything else
export function versionDate(version: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(version) === false) return '';
  const when = new Date(`${version}T12:00:00Z`);
  if (Number.isNaN(when.getTime())) return '';
  return when.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

// What the notice says, or null when there is nothing to ask: the current
// version is accepted, or the API does not tell (undefined: an API from
// before the terms were recorded).
export function termsNotice(accepted: string | null | undefined, current: string): TermsNoticeText | null {
  if (accepted === undefined || accepted === current) return null;
  if (accepted === null || accepted.trim() === '') {
    return {
      title: 'Please read and accept our Terms of Service and Privacy Policy',
      text: 'They explain how the platform works, what you agree to, and what happens to your personal data.',
    };
  }
  const date = versionDate(current);
  return {
    title: 'Our Terms of Service and Privacy Policy changed',
    text: `A new version${date === '' ? '' : `, dated ${date},`} replaces the one you accepted. Please read it and accept it.`,
  };
}
