import type { Metadata } from "next";
import { CheckoutFlow } from "./_checkout-flow";

export const metadata: Metadata = {
  title: "চেকআউট",
  description: "আপনার অর্ডার সম্পূর্ণ করুন।",
};

export default function CheckoutPage() {
  return <CheckoutFlow />;
}
