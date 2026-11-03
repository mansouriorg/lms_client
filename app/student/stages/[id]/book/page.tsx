import { redirect } from 'next/navigation';

// Old student booking URL: buying a course now happens on the checkout page,
// so links such as /student/stages/1/book keep working.
export default async function StudentBookStagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/checkout/${encodeURIComponent(id)}`);
}
