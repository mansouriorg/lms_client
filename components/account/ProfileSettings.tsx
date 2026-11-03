'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, RotateCcw, Save } from 'lucide-react';
import FieldError from '@/components/account/FieldError';
import PasswordForm from '@/components/account/PasswordForm';
import SignOutOthers from '@/components/account/SignOutOthers';
import { apiErrorMessage } from '@/lib/api-error';
import {
  type Profile,
  type ProfileErrors,
  type ProfileValues,
  NAME_MAX,
  memberSince,
  profileChanged,
  profileValues,
  readProfileForm,
} from '@/lib/profile';
import { authService } from '@/services/auth.service';
import { profileService } from '@/services/profile.service';

type Notice = { tone: 'success' | 'error'; text: string };

const FIELD =
  'block w-full px-3 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none';

// The messages under the fields: components/account/FieldError.tsx

// The signed-in user's own profile (GET and PATCH /users/me), for students
// (/student/settings) and academy admins (/center/settings). After saving, the
// sidebar shows the new name at once.
export default function ProfileSettings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saved, setSaved] = useState<ProfileValues | null>(null);
  const [values, setValues] = useState<ProfileValues>({ firstName: '', lastName: '', phone: '' });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    profileService.get().then(
      (loaded) => {
        if (active) {
          setProfile(loaded);
          setSaved(profileValues(loaded));
          setValues(profileValues(loaded));
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) setLoadError(apiErrorMessage(error, 'Could not load your profile. Please try again.'));
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const changed = saved !== null && profileChanged(saved, values);

  const change = (field: keyof ProfileValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setNotice(null);
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { errors: found, payload } = readProfileForm(values);
    setErrors(found);
    if (payload === null) return;
    setSaving(true);
    setNotice(null);
    try {
      const result = await profileService.update(payload);
      const next = profileValues(result.user);
      setSaved(next);
      setValues(next);
      setProfile((current) => (current === null ? current : { ...current, ...result.user }));
      authService.updateStoredUser({ firstName: result.user.firstName, lastName: result.user.lastName });
      setNotice({ tone: 'success', text: 'Your profile is saved.' });
    } catch (error) {
      setNotice({ tone: 'error', text: apiErrorMessage(error, 'Could not save your profile. Please try again.') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Your name appears in your space and next to your questions and answers.
        </p>
      </div>

      {loadError && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl"
        >
          <span className="flex items-start gap-2">
            <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
            {loadError}
          </span>
          <button
            type="button"
            onClick={() => {
              setLoadError('');
              setReloadKey((key) => key + 1);
            }}
            className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-400/30 text-red-300 font-medium hover:bg-red-400/10 transition-colors"
          >
            <RotateCcw aria-hidden="true" className="w-4 h-4" />
            Try again
          </button>
        </div>
      )}

      {profile === null && loadError === '' && (
        <p role="status" className="text-sm text-slate-400 py-8 text-center">
          Loading your profile...
        </p>
      )}

      {profile !== null && (
        <>
          <form
            onSubmit={save}
            noValidate
            aria-labelledby="profile-title"
            className="p-6 sm:p-8 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-6"
          >
            <div className="flex items-center gap-4">
              <span className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                {`${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase() || '?'}
              </span>
              <div className="min-w-0">
                <h2 id="profile-title" className="text-lg font-semibold text-white truncate">
                  {`${profile.firstName} ${profile.lastName}`.trim() || profile.email}
                </h2>
                <p className="text-sm text-slate-400">{memberSince(profile.createdAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="profile-first-name" className="text-sm font-medium text-slate-300">
                  First name
                </label>
                <input
                  id="profile-first-name"
                  value={values.firstName}
                  onChange={(e) => change('firstName', e.target.value)}
                  maxLength={NAME_MAX}
                  autoComplete="given-name"
                  aria-invalid={errors.firstName !== undefined}
                  aria-describedby={errors.firstName ? 'profile-first-name-error' : undefined}
                  className={`${FIELD} ${errors.firstName ? 'border-red-500/60' : 'border-slate-700'}`}
                />
                <FieldError id="profile-first-name-error" text={errors.firstName} />
              </div>
              <div className="space-y-2">
                <label htmlFor="profile-last-name" className="text-sm font-medium text-slate-300">
                  Last name
                </label>
                <input
                  id="profile-last-name"
                  value={values.lastName}
                  onChange={(e) => change('lastName', e.target.value)}
                  maxLength={NAME_MAX}
                  autoComplete="family-name"
                  aria-invalid={errors.lastName !== undefined}
                  aria-describedby={errors.lastName ? 'profile-last-name-error' : undefined}
                  className={`${FIELD} ${errors.lastName ? 'border-red-500/60' : 'border-slate-700'}`}
                />
                <FieldError id="profile-last-name-error" text={errors.lastName} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="profile-phone" className="text-sm font-medium text-slate-300">
                  Phone <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={values.phone}
                  onChange={(e) => change('phone', e.target.value)}
                  maxLength={25}
                  autoComplete="tel"
                  placeholder="+216 20 000 000"
                  aria-invalid={errors.phone !== undefined}
                  aria-describedby={errors.phone ? 'profile-phone-error' : 'profile-phone-help'}
                  className={`${FIELD} ${errors.phone ? 'border-red-500/60' : 'border-slate-700'}`}
                />
                {errors.phone ? (
                  <FieldError id="profile-phone-error" text={errors.phone} />
                ) : (
                  <p id="profile-phone-help" className="text-xs text-slate-500">
                    The academy can use it to reach you about a payment or a session.
                  </p>
                )}
              </div>
            </div>

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

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving || changed === false}
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save aria-hidden="true" className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              {changed && saving === false && saved !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setValues(saved);
                    setErrors({});
                  }}
                  className="py-2.5 px-4 rounded-xl text-sm text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
                >
                  Undo changes
                </button>
              )}
            </div>
          </form>

          <section aria-labelledby="sign-in-title" className="p-6 sm:p-8 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-2">
            <h2 id="sign-in-title" className="text-lg font-semibold text-white">
              Sign-in
            </h2>
            <p className="text-sm text-slate-300">
              Email: <span className="font-medium text-white">{profile.email}</span>
            </p>
            <p className="text-sm text-slate-400">
              Your email is how you sign in, so it cannot be changed here.
            </p>
            <PasswordForm />
            <SignOutOthers />
          </section>
        </>
      )}
    </div>
  );
}
