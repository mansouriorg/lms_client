import { redirect } from 'next/navigation';

// This page was a second copy of the course list from the previous template.
// The course list lives at /center/stages.
export default function ManageStagesPage() {
  redirect('/center/stages');
}
