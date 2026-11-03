'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ChevronLeft, Mail, MailCheck } from 'lucide-react';
import AuthPanel from '@/components/auth/AuthPanel';
import FieldError from '@/components/account/FieldError';
import { apiErrorMessage } from '@/lib/api-error';
import { readResetEmail } from '@/lib/password-reset';
import { passwordResetService } from '@/services/password-reset.service';

const BACK_LINK =
  'inline-flex items-center gap-1 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors';

// The Forgot password form (POST /auth/forgot-password). There is no email
// sending yet: the platform team checks the request and sends a link by
// hand, so the page says what happens next.
export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  // The answer of the API, once sent (the same for every email)
  const [answer, setAnswer] = useState<string | null>(null);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const read = readResetEmail(email);
    setFieldError(read.error);
    setSendError('');
    if (read.error !== '') return;
    setSending(true);
    try {
      setAnswer(await passwordResetService.forgot(read.email));
    } catch (error) {
      setSendError(apiErrorMessage(error, 'Could not send your request. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  const backToSignIn = (
    <Link href="/auth/login" className={BACK_LINK}>
      <ChevronLeft aria-hidden="true" className="h-4 w-4" />
      Back to sign in
    </Link>
  );

  if (answer !== null) {
    return (
      <AuthPanel title="Request sent" description="Your request to reset the password has been received.">
        <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          <MailCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{answer}</p>
        </div>
        <div className="space-y-2 text-sm text-slate-300">
          <h2 className="font-semibold text-white">What happens next</h2>
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>
              Someone from the platform team checks that the request comes from you, for example by calling the phone
              number of your account.
            </li>
            <li>They send you a link to choose a new password. The link works once, for 24 hours.</li>
            <li>
              No link after a day? Ask again here, or contact the academy whose course you bought: their details are on
              the{' '}
              <Link href="/centers" className="font-medium text-indigo-400 hover:text-indigo-300">
                Academies
              </Link>{' '}
              page.
            </li>
          </ol>
        </div>
        {backToSignIn}
      </AuthPanel>
    );
  }

  return (
    <AuthPanel
      title="Forgot your password?"
      description="Enter the email of your account. The platform team will send you a link to choose a new password."
    >
      {sendError && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-400">
          <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          {sendError}
        </p>
      )}
      <form noValidate onSubmit={send} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="reset-email" className="text-sm font-medium text-slate-300">
            Email address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Mail aria-hidden="true" className="h-5 w-5 text-slate-500" />
            </div>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldError('');
              }}
              aria-invalid={fieldError !== ''}
              aria-describedby={fieldError ? 'reset-email-error' : undefined}
              placeholder="you@example.com"
              className={`block w-full rounded-xl border bg-slate-800/50 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 ${
                fieldError ? 'border-red-500/60' : 'border-slate-700'
              }`}
            />
          </div>
          <FieldError id="reset-email-error" text={fieldError || undefined} />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
        >
          {sending ? 'Sending...' : 'Ask for a reset link'}
        </button>
      </form>
      {backToSignIn}
    </AuthPanel>
  );
}
