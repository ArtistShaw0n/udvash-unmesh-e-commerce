import type { Metadata } from "next";
import { AuthCard } from "@/components/organisms";

export const metadata: Metadata = {
  title: "লগইন করুন",
  description: "আপনার একাউন্টে প্রবেশ করুন।",
};

export default function LoginPage() {
  return <AuthCard mode="login" />;
}
