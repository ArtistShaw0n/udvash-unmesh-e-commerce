import { OrderDetailView } from "./_order-detail";

export const metadata = { title: "অর্ডার ডিটেইল" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <OrderDetailView orderId={id} />;
}
