'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import FieldError from '@/components/account/FieldError';
import { apiErrorMessage } from '@/lib/api-error';
import {
  type PasswordErrors,
  type PasswordValues,
  PASSWORD_MAX,
  PASSWORD_MIN,
  readPasswordForm,
} from '@/lib/profile';
import { authService } from '@/services/auth.service';
import { profileService } from '@/services/profile.service';

type Notice = { tone: 'success' | 'error'; text: string };

const EMPTY: PasswordValues = { currentPassword: '', newPassword: '', confirmPassword: '' };

const FIELDS: { key: keyof PasswordValues; id: string; label: string; autoComplete: string }[] = [
  { key: 'currentPassword', id: 'password-current', label: 'Current password', autoComplete: 'current-password' },
  { key: 'newPassword', id: 'password-new', label: 'New password', autoComplete: 'new-password' },
  { key: 'confirmPassword', id: 'password-confirm', label: 'New password again', autoComplete: 'new-password' },
];

const CHANGED_TEXT =
  'Your password is changed. Other browsers and devices where you were signed in are signed out.';

// Settings: change the password (POST /auth/change-password). The API checks
// the current password; the new one is used at the next sign-in. The other
// browsers and devices are signed out; this one keeps the new token.
export default function PasswordForm() {
  const [values, setValues] = useState<PasswordValues>(EMPTY);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [saving, setSaving] = useState(false);

  const change = (field: keyof PasswordValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setNotice(null);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { errors: found, payload } = readPasswordForm(values);
    setErrors(found);
    if (payload === null) return;
    setSaving(true);
    setNotice(null);
    try {
      const answer = await profileService.changePassword(payload);
      if (answer.access_token) authService.replaceToken(answer.access_token);
      setValues(EMPTY);
      setNotice({ tone: 'success', text: CHANGED_TEXT });
    } catch (error) {
      setNotice({ tone: 'error', text: apiErrorMessage(error, 'Could not change your password. Please try again.') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-labelledby="password-title"
      className="mt-6 pt-6 border-t border-slate-800 space-y-4"
    >
      <h3 id="password-title" className="text-sm font-semibold text-white">
        Change your password
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FIELDS.map((field) => {
          const error = errors[field.key];
          return (
            <div key={field.key} className="space-y-2">
              <label htmlFor={field.id} className="text-sm font-medium text-slate-300">
                {field.label}
              </label>
              <input
                id={field.id}
                type="password"
                value={values[field.key]}
                onChange={(e) => change(field.key, e.target.value)}
                maxLength={PASSWORD_MAX}
                autoComplete={field.autoComplete}
                aria-invalid={error !== undefined}
                aria-describedby={error ? `${field.id}-error` : undefined}
                className={`block w-full px-3 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none ${
                  error ? 'border-red-500/60' : 'border-slate-700'
                }`}
              />
              <FieldError id={`${field.id}-error`} text={error} />
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">At least {PASSWORD_MIN} characters. Spaces count too.</p>

      {notice && (
        <p
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={`flex items-start gap-2 text-sm ${notice.tone === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
        >
          {notice.tone === 'error' ? (
            <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          {notice.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
      >
        <KeyRound aria-hidden="true" className="w-4 h-4" />
        {saving ? 'Changing...' : 'Change password'}
      </button>
    </form>
  );
}
