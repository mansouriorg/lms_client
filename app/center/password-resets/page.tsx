'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Copy, KeyRound, Mail, Phone, RotateCcw } from 'lucide-react';
import FieldError from '@/components/account/FieldError';
import { mailHref, phoneHref } from '@/lib/academies';
import { apiErrorMessage } from '@/lib/api-error';
import { roleLabel } from '@/lib/auth';
import { readResetEmail } from '@/lib/password-reset';
import { timeAgo } from '@/lib/qa';
import {
  type ResetRequest,
  linkMessage,
  resetLink,
  splitResets,
  stateLabel,
  untilLabel,
  userName,
} from '@/lib/reset-requests';
import { useSession } from '@/lib/use-session';
import { passwordResetService } from '@/services/password-reset.service';

const MAIN_BUTTON =
  'inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors whitespace-nowrap disabled:opacity-50';
const PLAIN_BUTTON =
  'inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors whitespace-nowrap disabled:opacity-50';
const STATE_STYLES: Record<ResetRequest['state'], string> = {
  requested: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  'link-expired': 'text-red-300 bg-red-500/10 border-red-500/20',
  'link-active': 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
  used: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
};

// The link just created, shown once
type NewLink = { name: string; firstName: string; link: string; until: string };

// Password resets (platform admins): the requests of the Forgot password
// page. Check who asked, create a one-time link (24 hours) and send it by
// hand; or start a reset for someone who called (GET and POST
// /auth/password-resets).
export default function PasswordResetsPage() {
  const { known, user } = useSession();
  const role = user?.role ?? null;
  const [resets, setResets] = useState<ResetRequest[] | null>(null);
  // When the list was loaded ("3 h ago" depends on it)
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [created, setCreated] = useState<NewLink | null>(null);
  const [copied, setCopied] = useState('');
  // The reset whose link is being created ('email' for the form)
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (role !== 'SUPER_ADMIN') return;
    let active = true;
    passwordResetService.list().then(
      (list) => {
        if (active) {
          setResets(list);
          setLoadedAt(new Date());
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) setLoadError(apiErrorMessage(error, 'Could not load the password resets. Please try again.'));
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey, role]);

  const reload = () => setReloadKey((key) => key + 1);

  const showLink = (name: string, firstName: string, token: string, expiresAt: string) => {
    setCreated({ name, firstName, link: resetLink(window.location.origin, token), until: untilLabel(expiresAt) });
    setCopied('');
  };

  const createFor = async (reset: ResetRequest) => {
    setBusy(reset.id);
    setActionError('');
    try {
      const made = await passwordResetService.createLink(reset.id);
      showLink(userName(reset.user), reset.user.firstName, made.token, made.expiresAt);
      reload();
    } catch (error) {
      setActionError(apiErrorMessage(error, 'Could not create the link. Please try again.'));
    } finally {
      setBusy(null);
    }
  };

  const startFor = async (event: React.FormEvent) => {
    event.preventDefault();
    const read = readResetEmail(email);
    setEmailError(read.error);
    setActionError('');
    if (read.error !== '') return;
    setBusy('email');
    try {
      const made = await passwordResetService.createForEmail(read.email);
      showLink(read.email, '', made.token, made.expiresAt);
      setEmail('');
      reload();
    } catch (error) {
      setActionError(apiErrorMessage(error, 'Could not create the link. Please try again.'));
    } finally {
      setBusy(null);
    }
  };

  const copy = async (what: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
    } catch {
      setCopied('');
      setActionError('Could not copy here: select the link in the box and copy it.');
    }
  };

  if (known && role !== 'SUPER_ADMIN') {
    return (
      <div className="max-w-xl p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
        <h1 className="text-xl font-bold text-white">Password resets</h1>
        <p className="text-sm text-slate-400">
          Only platform admins reset forgotten passwords. A student of your academy who forgot their password can ask
          on the Forgot password page of the sign-in screen.
        </p>
      </div>
    );
  }

  const { todo, others } = splitResets(resets ?? []);

  const card = (reset: ResetRequest) => {
    const mail = mailHref(reset.user.email);
    const call = reset.user.phone ? phoneHref(reset.user.phone) : null;
    return (
      <li
        key={reset.id}
        className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800"
      >
        <div className="flex-1 min-w-0 space-y-1">
          <p className="font-semibold text-white break-words">
            {userName(reset.user)}{' '}
            <span className="text-xs font-normal text-slate-400">
              {roleLabel(reset.user.role)}
              {reset.user.center ? ` - ${reset.user.center.name}` : ''}
            </span>
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-300">
            {mail ? (
              <a href={mail} className="inline-flex items-center gap-1.5 hover:text-indigo-300 break-all">
                <Mail aria-hidden="true" className="w-4 h-4 shrink-0 text-slate-500" />
                {reset.user.email}
              </a>
            ) : (
              <span className="break-all">{reset.user.email}</span>
            )}
            {call ? (
              <a href={call} className="inline-flex items-center gap-1.5 hover:text-indigo-300">
                <Phone aria-hidden="true" className="w-4 h-4 shrink-0 text-slate-500" />
                {reset.user.phone}
              </a>
            ) : (
              <span className="text-slate-500">No phone number on the account</span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {reset.requestedAt === null
              ? 'Started by a platform admin'
              : `Asked ${loadedAt === null ? '' : timeAgo(reset.requestedAt, loadedAt)}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${STATE_STYLES[reset.state]}`}>
            {stateLabel(reset.state)}
            {reset.state === 'link-active' && reset.expiresAt ? `, ${untilLabel(reset.expiresAt)}` : ''}
          </span>
          {reset.state !== 'used' && (
            <button
              type="button"
              onClick={() => createFor(reset)}
              disabled={busy !== null}
              aria-label={`${reset.state === 'requested' ? 'Create a link' : 'Create a new link'} for ${userName(reset.user)}`}
              className={reset.state === 'link-active' ? PLAIN_BUTTON : MAIN_BUTTON}
            >
              <KeyRound aria-hidden="true" className="w-4 h-4" />
              {busy === reset.id ? 'Creating...' : reset.state === 'requested' ? 'Create a link' : 'Create a new link'}
            </button>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Password resets</h1>
        <p className="text-sm text-slate-400 mt-1">
          People who forgot their password ask on the Forgot password page. Check that a request really comes from
          them (call the phone number of the account, for example), then create a link and send it to them: it works
          once, for 24 hours. There is no email sending yet.
        </p>
      </div>

      {created && (
        <section
          aria-labelledby="new-link"
          className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4"
        >
          <div className="space-y-1">
            <h2 id="new-link" className="text-lg font-semibold text-white break-words">
              Link for {created.name}
            </h2>
            <p className="text-sm text-slate-300">
              It works once, {created.until}. It is shown only now: send it to {created.name} only, by a way you trust
              (WhatsApp, a text message, their email).
            </p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="reset-link" className="text-sm font-medium text-slate-300">
              Reset link
            </label>
            <input
              id="reset-link"
              readOnly
              value={created.link}
              onFocus={(e) => e.target.select()}
              className="block w-full px-3 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-sm text-white font-mono"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => copy('link', created.link)} className={MAIN_BUTTON}>
              <Copy aria-hidden="true" className="w-4 h-4" />
              Copy the link
            </button>
            <button
              type="button"
              onClick={() => copy('message', linkMessage(created.firstName, created.link, created.until))}
              className={PLAIN_BUTTON}
            >
              <Copy aria-hidden="true" className="w-4 h-4" />
              Copy a message with the link
            </button>
            <button type="button" onClick={() => setCreated(null)} className={PLAIN_BUTTON}>
              Done
            </button>
          </div>
          <p role="status" className="flex items-center gap-2 text-sm text-emerald-300">
            {copied !== '' && <CheckCircle2 aria-hidden="true" className="w-4 h-4" />}
            {copied === 'link' ? 'Link copied.' : copied === 'message' ? 'Message copied.' : ''}
          </p>
        </section>
      )}

      {actionError && (
        <p role="alert" className="flex items-start gap-2 text-sm text-red-400">
          <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
          {actionError}
        </p>
      )}

      <form
        noValidate
        onSubmit={startFor}
        aria-label="Start a reset"
        className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3"
      >
        <h2 className="text-base font-semibold text-white">Start a reset</h2>
        <p className="text-sm text-slate-400">For someone who asked you another way, for example by phone.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-1.5">
            <label htmlFor="start-email" className="sr-only">
              Email of the account
            </label>
            <input
              id="start-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              placeholder="Email of the account"
              aria-invalid={emailError !== ''}
              aria-describedby={emailError ? 'start-email-error' : undefined}
              className={`block w-full px-3 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none ${
                emailError ? 'border-red-500/60' : 'border-slate-700'
              }`}
            />
            <FieldError id="start-email-error" text={emailError || undefined} />
          </div>
          <button type="submit" disabled={busy !== null} className={`${MAIN_BUTTON} self-start py-2.5`}>
            <KeyRound aria-hidden="true" className="w-4 h-4" />
            {busy === 'email' ? 'Creating...' : 'Create a link'}
          </button>
        </div>
      </form>

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
              reload();
            }}
            className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-400/30 text-red-300 font-medium hover:bg-red-400/10 transition-colors"
          >
            <RotateCcw aria-hidden="true" className="w-4 h-4" />
            Try again
          </button>
        </div>
      )}

      {resets === null && loadError === '' && (
        <p role="status" className="py-8 text-center text-sm text-slate-400">
          Loading the password resets...
        </p>
      )}

      {resets !== null && resets.length === 0 && (
        <p className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-sm text-slate-400">
          No password reset in the last 30 days.
        </p>
      )}

      {todo.length > 0 && (
        <section aria-labelledby="resets-todo" className="space-y-3">
          <h2 id="resets-todo" className="text-lg font-semibold text-white">
            To do ({todo.length})
          </h2>
          <ul className="space-y-3">{todo.map(card)}</ul>
        </section>
      )}

      {others.length > 0 && (
        <section aria-labelledby="resets-others" className="space-y-3">
          <h2 id="resets-others" className="text-lg font-semibold text-white">
            Links sent and done
          </h2>
          <ul className="space-y-3">{others.map(card)}</ul>
        </section>
      )}
    </div>
  );
}
