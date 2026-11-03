'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, FileText, X } from 'lucide-react';
import { apiErrorMessage } from '@/lib/api-error';
import { LEGAL_UPDATED } from '@/lib/legal';
import { termsNotice } from '@/lib/terms-acceptance';
import { profileService } from '@/services/profile.service';

const LINK = 'font-medium text-indigo-300 underline underline-offset-2 hover:text-indigo-200';

// At the top of every page of the signed-in spaces (student, academy admin,
// platform admin): asks the account to accept the current Terms of Service
// and Privacy Policy (POST /users/me/terms) until it has. Nothing is shown
// when GET /users/me cannot be read: the pages work without it.
export default function TermsNotice() {
  // The version accepted (null: none); undefined until GET /users/me answers
  const [accepted, setAccepted] = useState<string | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [thanks, setThanks] = useState(false);

  useEffect(() => {
    let active = true;
    profileService.get().then(
      (profile) => {
        if (active) setAccepted(profile.termsVersion);
      },
      () => undefined,
    );
    return () => {
      active = false;
    };
  }, []);

  const accept = async () => {
    setSaving(true);
    setError('');
    try {
      const saved = await profileService.acceptTerms(LEGAL_UPDATED);
      setAccepted(saved.termsVersion);
      setThanks(true);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not record your answer. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  if (thanks) {
    return (
      <div
        role="status"
        className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
      >
        <span className="flex items-center gap-2">
          <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0" />
          Thank you: your acceptance is recorded.
        </span>
        <button
          type="button"
          onClick={() => setThanks(false)}
          aria-label="Close"
          className="rounded-lg p-1 text-emerald-200 hover:bg-emerald-500/10"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const notice = termsNotice(accepted, LEGAL_UPDATED);
  if (notice === null) return null;

  return (
    <section
      aria-labelledby="terms-notice-title"
      className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <FileText aria-hidden="true" className="hidden h-6 w-6 shrink-0 text-amber-300 md:block" />
        <div className="min-w-0 flex-1 space-y-1">
          <h2 id="terms-notice-title" className="text-base font-semibold text-white">
            {notice.title}
          </h2>
          <p className="text-sm text-slate-300">
            {notice.text} Read the{' '}
            <Link href="/terms" target="_blank" rel="noopener" className={LINK}>
              Terms of Service
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>{' '}
            and the{' '}
            <Link href="/privacy" target="_blank" rel="noopener" className={LINK}>
              Privacy Policy
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={accept}
          disabled={saving}
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'I am 18 or older and I accept'}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-red-400">
          <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </section>
  );
}
