import { redirect } from 'next/navigation';

// Old course detail URL: forwards to the course page in the catalog.
export default async function StageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/products/${encodeURIComponent(id)}`);
}
