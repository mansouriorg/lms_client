import { redirect } from 'next/navigation';

// Old booking URL: buying a course now happens on the checkout page.
export default async function StageBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/checkout/${encodeURIComponent(id)}`);
}
