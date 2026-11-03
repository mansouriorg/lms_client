'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, LogOut } from 'lucide-react';
import { apiErrorMessage } from '@/lib/api-error';
import { authService } from '@/services/auth.service';
import { profileService } from '@/services/profile.service';

type Notice = { tone: 'success' | 'error'; text: string };

// Settings: signs out every other browser and device of the account (POST
// /auth/sign-out-others), for example after signing in on a shared or lost
// computer. This browser keeps going with the new token of the answer.
export default function SignOutOthers() {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const signOutOthers = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const answer = await profileService.signOutOthers();
      authService.replaceToken(answer.access_token);
      setNotice({
        tone: 'success',
        text: 'Your other browsers and devices are signed out. You stay signed in here.',
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        text: apiErrorMessage(error, 'Could not sign out the other browsers. Please try again.'),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="sign-out-others-title" className="mt-6 pt-6 border-t border-slate-800 space-y-3">
      <h3 id="sign-out-others-title" className="text-sm font-semibold text-white">
        Other browsers and devices
      </h3>
      <p className="text-sm text-slate-400">
        Signed in on a shared or lost computer? Sign it out from here. This browser stays signed in.
      </p>
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
        type="button"
        onClick={signOutOthers}
        disabled={busy}
        className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-medium text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors disabled:opacity-50"
      >
        <LogOut aria-hidden="true" className="w-4 h-4" />
        {busy ? 'Signing out...' : 'Sign out everywhere else'}
      </button>
    </section>
  );
}
