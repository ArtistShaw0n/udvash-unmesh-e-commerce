import { AdminOrderDetail } from "./_detail";

export const metadata = { title: "অর্ডার ডিটেইল" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <AdminOrderDetail orderId={id} />;
}
