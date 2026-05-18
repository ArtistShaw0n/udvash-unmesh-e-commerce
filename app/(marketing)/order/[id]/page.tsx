import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * `/order/[id]` historically rendered hardcoded demo content for an
 * order that didn't exist. The real order-detail page lives at
 * `/account/orders/[id]` (auth-gated, fetches from the orders store).
 *
 * Keep this route as a permanent redirect so old emails / external
 * links resolve to the correct page instead of leaking fake data.
 * `/order/[id]/success` lives in a sibling folder and continues to work.
 */
export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/account/orders/${encodeURIComponent(id)}`);
}
