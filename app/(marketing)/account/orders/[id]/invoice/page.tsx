import { OrderInvoice } from "./_invoice";

export const metadata = {
  title: "Invoice",
  robots: { index: false, follow: false }, // private — no SEO
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderInvoicePage({ params }: PageProps) {
  const { id } = await params;
  return <OrderInvoice orderId={id} />;
}
