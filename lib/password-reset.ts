// Forgotten passwords: the Forgot password page (/auth/forgot-password) and
// the page the reset link opens (/auth/reset-password?token=...). The checks
// before sending (the API checks the same) and the secret of the link.
// The file has no imports, so `pnpm test` can run it with Node directly.

export const RESET_PASSWORD_MIN = 8;
export const RESET_PASSWORD_MAX = 128;

// The email typed, cleaned like the API does (spaces around, capitals), and
// what is wrong with it ('' when nothing)
export function readResetEmail(value: string): { email: string; error: string } {
  const email = value.trim().toLowerCase();
  if (email === '') return { email, error: 'Please enter the email of your account.' };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) === false) {
    return { email, error: 'Please enter a valid email address.' };
  }
  return { email, error: '' };
}

export type NewPasswordValues = { password: string; confirm: string };
export type NewPasswordErrors = Partial<Record<keyof NewPasswordValues, string>>;

// The new password to send (not trimmed: a space can be part of it), or the
// errors to show
export function readNewPasswordForm(values: NewPasswordValues): {
  errors: NewPasswordErrors;
  password: string | null;
} {
  const errors: NewPasswordErrors = {};
  if (values.password.length < RESET_PASSWORD_MIN) {
    errors.password = `The new password must be at least ${RESET_PASSWORD_MIN} characters long.`;
  } else if (values.password.length > RESET_PASSWORD_MAX) {
    errors.password = `The new password can have at most ${RESET_PASSWORD_MAX} characters.`;
  } else if (values.confirm !== values.password) {
    errors.confirm = 'The two passwords are not the same.';
  }
  return { errors, password: Object.keys(errors).length === 0 ? values.password : null };
}

// The secret of the link in the address ("?token=..."), or '' when missing
export function tokenFrom(search: string): string {
  return (new URLSearchParams(search).get('token') ?? '').trim();
}
