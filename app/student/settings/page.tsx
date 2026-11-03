import type { Metadata } from 'next';
import ProfileSettings from '@/components/account/ProfileSettings';

export const metadata: Metadata = {
  title: 'Settings',
};

// The student's own profile: name and phone (GET and PATCH /users/me).
export default function StudentSettingsPage() {
  return <ProfileSettings />;
}
