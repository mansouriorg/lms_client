// The Settings page (/student/settings and /center/settings): the profile
// GET /users/me sends, and the checks of the form (the same as the API's
// UpdateUserDto, so most mistakes are shown before anything is sent).
// The file has no imports, so `pnpm test` can run it with Node directly.

// GET /users/me
export type Profile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  createdAt: string;
  // The version (date) of the Terms of Service and Privacy Policy accepted,
  // and when; null: not accepted yet (absent from an API older than this)
  termsVersion?: string | null;
  termsAcceptedAt?: string | null;
};

export type ProfileValues = { firstName: string; lastName: string; phone: string };
export type ProfileErrors = Partial<Record<keyof ProfileValues, string>>;

export const NAME_MAX = 50;
const PHONE = /^\+?[0-9 ().-]{6,25}$/;

// The form, filled with the saved profile.
export function profileValues(profile: Pick<Profile, 'firstName' | 'lastName' | 'phone'>): ProfileValues {
  return { firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone ?? '' };
}

// The trimmed values to send (PATCH /users/me), or the errors to show.
// An empty phone removes it.
export function readProfileForm(values: ProfileValues): {
  errors: ProfileErrors;
  payload: ProfileValues | null;
} {
  const payload = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phone: values.phone.trim(),
  };
  const errors: ProfileErrors = {};
  if (payload.firstName === '') errors.firstName = 'Please enter your first name.';
  else if (payload.firstName.length > NAME_MAX)
    errors.firstName = `The first name can have at most ${NAME_MAX} characters.`;
  if (payload.lastName === '') errors.lastName = 'Please enter your last name.';
  else if (payload.lastName.length > NAME_MAX)
    errors.lastName = `The last name can have at most ${NAME_MAX} characters.`;
  if (payload.phone !== '' && PHONE.test(payload.phone) === false)
    errors.phone = 'Please enter a valid phone number, like +216 20 000 000.';
  return { errors, payload: Object.keys(errors).length === 0 ? payload : null };
}

// True when the form differs from the saved profile (the Save button is
// only useful then).
export function profileChanged(saved: ProfileValues, current: ProfileValues): boolean {
  return (
    saved.firstName !== current.firstName.trim() ||
    saved.lastName !== current.lastName.trim() ||
    saved.phone !== current.phone.trim()
  );
}

// "Member since October 2026"
export function memberSince(iso: string): string {
  const when = new Date(iso);
  if (Number.isNaN(when.getTime())) return '';
  return `Member since ${when.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })}`;
}

// The Change password form (POST /auth/change-password).
export type PasswordValues = { currentPassword: string; newPassword: string; confirmPassword: string };
export type PasswordErrors = Partial<Record<keyof PasswordValues, string>>;

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

// The values to send, or the errors to show (the API checks the same, and
// also that the current password is right). Passwords are not trimmed.
export function readPasswordForm(values: PasswordValues): {
  errors: PasswordErrors;
  payload: { currentPassword: string; newPassword: string } | null;
} {
  const errors: PasswordErrors = {};
  if (values.currentPassword === '') errors.currentPassword = 'Please enter your current password.';
  if (values.newPassword.length < PASSWORD_MIN)
    errors.newPassword = `The new password must be at least ${PASSWORD_MIN} characters long.`;
  else if (values.newPassword.length > PASSWORD_MAX)
    errors.newPassword = `The new password can have at most ${PASSWORD_MAX} characters.`;
  else if (values.newPassword === values.currentPassword)
    errors.newPassword = 'Choose a new password that is different from the current one.';
  if (errors.newPassword === undefined && values.confirmPassword !== values.newPassword)
    errors.confirmPassword = 'The two new passwords are not the same.';
  return {
    errors,
    payload:
      Object.keys(errors).length === 0
        ? { currentPassword: values.currentPassword, newPassword: values.newPassword }
        : null,
  };
}
