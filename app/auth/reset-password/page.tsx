import type { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

// The address holds the secret of the link: it is not sent to other sites
// (no Referer) and the page is not indexed.
export const metadata: Metadata = {
  title: 'Choose a new password',
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
};

// The page a reset link opens (components/auth/ResetPasswordForm)
export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
