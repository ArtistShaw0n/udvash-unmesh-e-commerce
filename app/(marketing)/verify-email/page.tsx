import type { Metadata } from "next";
import { VerifyEmailForm } from "./_verify-form";

export const metadata: Metadata = {
  title: "ইমেইল ভেরিফাই",
  description: "আপনার একাউন্টের ইমেইল ভেরিফাই করুন।",
};

export default function VerifyEmailPage() {
  return <VerifyEmailForm />;
}
