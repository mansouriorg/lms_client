'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import AuthPanel from '@/components/auth/AuthPanel';
import FieldError from '@/components/account/FieldError';
import { apiErrorMessage } from '@/lib/api-error';
import {
  type NewPasswordErrors,
  RESET_PASSWORD_MAX,
  RESET_PASSWORD_MIN,
  readNewPasswordForm,
  tokenFrom,
} from '@/lib/password-reset';
import { passwordResetService } from '@/services/password-reset.service';

const FIELD =
  'block w-full rounded-xl border bg-slate-800/50 py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50';
const LINK = 'font-medium text-indigo-400 hover:text-indigo-300 transition-colors';

// The address does not change while the page is open
const noChanges = () => () => {};

// The page the reset link opens (/auth/reset-password?token=...): choose the
// new password (POST /auth/reset-password). The link works once, for 24
// hours; once used, its secret is taken out of the address.
export default function ResetPasswordForm() {
  // The secret of the link: null while the page is drawn on the server
  const token = useSyncExternalStore(
    noChanges,
    () => tokenFrom(window.location.search),
    () => null,
  );
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<NewPasswordErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [done, setDone] = useState<string | null>(null);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (token === null || token === '') return;
    const read = readNewPasswordForm({ password, confirm });
    setErrors(read.errors);
    setSaveError('');
    if (read.password === null) return;
    setSaving(true);
    try {
      const message = await passwordResetService.reset(token, read.password);
      // The link is used: its secret leaves the address bar and the history
      window.history.replaceState(null, '', window.location.pathname);
      setDone(message);
    } catch (error) {
      setSaveError(apiErrorMessage(error, 'Could not change your password. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  if (done !== null) {
    return (
      <AuthPanel title="Password changed" description="You can now sign in with your new password.">
        <p role="status" className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          {done}
        </p>
        <Link
          href="/auth/login"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          Sign in
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </AuthPanel>
    );
  }

  if (token === '') {
    return (
      <AuthPanel
        title="This link is not complete"
        description="Open the link you received again, exactly as it was sent, or ask for a new one."
      >
        <Link href="/auth/forgot-password" className={LINK}>
          Ask for a new link
        </Link>
      </AuthPanel>
    );
  }

  const fieldClass = (field: keyof NewPasswordErrors) =>
    `${FIELD} ${errors[field] ? 'border-red-500/60' : 'border-slate-700'}`;

  return (
    <AuthPanel
      title="Choose a new password"
      description={`Your new password needs ${RESET_PASSWORD_MIN} to ${RESET_PASSWORD_MAX} characters. This link works once.`}
    >
      {saveError && (
        <div role="alert" className="space-y-2 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-400">
          <p className="flex items-start gap-2">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            {saveError}
          </p>
          <Link href="/auth/forgot-password" className={`${LINK} block pl-6`}>
            Ask for a new link
          </Link>
        </div>
      )}
      <form noValidate onSubmit={save} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="new-password" className="text-sm font-medium text-slate-300">
            New password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Lock aria-hidden="true" className="h-5 w-5 text-slate-500" />
            </div>
            <input
              id="new-password"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              maxLength={RESET_PASSWORD_MAX}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({});
              }}
              aria-invalid={errors.password !== undefined}
              aria-describedby={errors.password ? 'new-password-error' : undefined}
              className={fieldClass('password')}
            />
            <button
              type="button"
              onClick={() => setShow((value) => value === false)}
              aria-label={show ? 'Hide the passwords' : 'Show the passwords'}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 transition-colors hover:text-slate-300"
            >
              {show ? <EyeOff aria-hidden="true" className="h-5 w-5" /> : <Eye aria-hidden="true" className="h-5 w-5" />}
            </button>
          </div>
          <FieldError id="new-password-error" text={errors.password} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="text-sm font-medium text-slate-300">
            New password again
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Lock aria-hidden="true" className="h-5 w-5 text-slate-500" />
            </div>
            <input
              id="confirm-password"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirm}
              maxLength={RESET_PASSWORD_MAX}
              onChange={(e) => {
                setConfirm(e.target.value);
                setErrors({});
              }}
              aria-invalid={errors.confirm !== undefined}
              aria-describedby={errors.confirm ? 'confirm-password-error' : undefined}
              className={fieldClass('confirm')}
            />
          </div>
          <FieldError id="confirm-password-error" text={errors.confirm} />
        </div>
        <button
          type="submit"
          disabled={saving || token === null}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save the new password'}
        </button>
      </form>
    </AuthPanel>
  );
}
