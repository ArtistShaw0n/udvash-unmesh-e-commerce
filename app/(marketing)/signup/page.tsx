import type { Metadata } from "next";
import { AuthCard } from "@/components/organisms";

export const metadata: Metadata = {
  title: "সাইন আপ করুন",
  description: "নতুন একাউন্ট তৈরি করে কেনাকাটা শুরু করুন।",
};

export default function SignupPage() {
  return <AuthCard mode="signup" />;
}
