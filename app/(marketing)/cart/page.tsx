import type { Metadata } from "next";
import { CartPage } from "./_cart-page";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "আপনার কার্টের সকল বই দেখুন এবং চেকআউট করুন।",
};

export default function Cart() {
  return <CartPage />;
}
