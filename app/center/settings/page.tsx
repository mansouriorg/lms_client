import type { Metadata } from 'next';
import ProfileSettings from '@/components/account/ProfileSettings';

export const metadata: Metadata = {
  title: 'Settings',
};

// The admin's own profile: name and phone (GET and PATCH /users/me). Students
// see this name next to the academy's answers.
export default function CenterSettingsPage() {
  return <ProfileSettings />;
}
