"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ChevronLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { api } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return;
    setBusy(true);
    const r = await api.forgotPassword(email.trim());
    setBusy(false);
    // Generic success on either path — we never reveal whether the email exists
    // (avoids the "is this user registered?" enumeration attack). The API
    // already silently noop's for unknown emails.
    if (r.ok) {
      setSent(true);
    } else {
      setError(r.error || "অনুরোধ পাঠাতে সমস্যা হয়েছে");
    }
  }

  return (
    <section className="section-pad-sm">
      <div className="container-site flex justify-center">
        <div className="w-full max-w-md rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card p-6 sm:p-8 space-y-6">
          <Link href="/login" className="inline-flex items-center gap-1 text-body-sm text-[var(--fg-secondary)] hover:text-brand-700">
            <ChevronLeft size={16} /> লগইনে ফিরে যান
          </Link>

          {!sent ? (
            <>
              <div className="text-center space-y-2">
                <div className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300">
                  <Mail size={26} />
                </div>
                <h1 className="text-h2 text-[var(--fg-primary)]">পাসওয়ার্ড ভুলে গেছেন?</h1>
                <p className="text-body-sm text-[var(--fg-secondary)]">
                  আপনার ইমেইল দিন — আমরা পাসওয়ার্ড রিসেট কোড পাঠিয়ে দেব।
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-md bg-discount-50 dark:bg-discount-900/20 border border-discount-200 dark:border-discount-700/40 px-3 py-2 text-body-sm text-discount-800 dark:text-discount-200"
                >
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={onSubmit}>
                <FormField
                  id="email"
                  type="email"
                  label="ইমেইল"
                  placeholder="আপনার ইমেইল দিন"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail size={18} />}
                  autoComplete="email"
                  required
                />
                <Button type="submit" variant="primary" size={{ base: "md", md: "lg" }} fullWidth disabled={busy}>
                  {busy ? "পাঠানো হচ্ছে..." : "রিসেট কোড পাঠান"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-3">
              <div className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-success-100 text-success-700 dark:bg-success-700/30 dark:text-success-300">
                <MailCheck size={32} />
              </div>
              <h1 className="text-h2 text-[var(--fg-primary)]">ইমেইল পাঠানো হয়েছে</h1>
              <p className="text-body text-[var(--fg-secondary)]">
                <span className="font-semibold text-[var(--fg-primary)]">{email}</span>{" "}
                এ একটি রিসেট কোড পাঠানো হয়েছে। ইমেইল ইনবক্স চেক করুন।
              </p>
              <p className="text-caption text-[var(--fg-muted)] pt-2">
                কোড না পেলে স্প্যাম ফোল্ডার চেক করুন, অথবা আবার চেষ্টা করুন।
              </p>
              <div className="space-y-2 pt-2">
                <Button
                  href={`/reset-password?email=${encodeURIComponent(email)}`}
                  variant="primary"
                  size={{ base: "md", md: "lg" }}
                  fullWidth
                >
                  কোড দিয়ে নতুন পাসওয়ার্ড সেট করুন
                </Button>
                <Button variant="secondary" onClick={() => setSent(false)} fullWidth>
                  আবার চেষ্টা করুন
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
