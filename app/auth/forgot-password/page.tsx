import type { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Reset your password',
};

// Ask for a link to choose a new password (components/auth/ForgotPasswordForm)
export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
