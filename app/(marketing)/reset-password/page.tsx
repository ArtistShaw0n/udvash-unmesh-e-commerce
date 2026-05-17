"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { api } from "@/lib/api-client";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Shell />}>
      <Inner />
    </Suspense>
  );
}

function Shell({ children }: { children?: React.ReactNode }) {
  return (
    <section className="section-pad-sm">
      <div className="container-site flex justify-center">
        <div className="w-full max-w-md rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card p-6 sm:p-8 space-y-6">
          {children}
        </div>
      </div>
    </section>
  );
}

function Inner() {
  const router = useRouter();
  const params = useSearchParams();

  // Pre-fill email + code from query string when the user came in through
  // the reset email link (forgot-password page sends them here with both).
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState(params.get("code") ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const matches = password.length >= 6 && password === confirm;
  const canSubmit = email.trim() && code.trim() && matches && !busy;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canSubmit) return;
    setBusy(true);
    const r = await api.resetPassword({
      email: email.trim(),
      code: code.trim(),
      password,
    });
    setBusy(false);
    if (!r.ok) {
      setError(r.error || "পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে");
      return;
    }
    setDone(true);
    // Auto-redirect to login after 1.5s so the user doesn't have to click.
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <Shell>
      {!done ? (
        <>
          <div className="text-center space-y-2">
            <div className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300">
              <Lock size={26} />
            </div>
            <h1 className="text-h2 text-[var(--fg-primary)]">নতুন পাসওয়ার্ড</h1>
            <p className="text-body-sm text-[var(--fg-secondary)]">
              ইমেইলে পাওয়া কোড আর নতুন পাসওয়ার্ড দিন।
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
              placeholder="আপনার ইমেইল"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={18} />}
              autoComplete="email"
              required
            />
            <FormField
              id="code"
              label="রিসেট কোড"
              placeholder="৬ ডিজিটের কোড"
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              required
            />
            <FormField
              id="pw"
              label="নতুন পাসওয়ার্ড"
              placeholder="কমপক্ষে ৬ অক্ষর"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={18} />}
              togglePassword
              required
            />
            <FormField
              id="pwc"
              label="পাসওয়ার্ড নিশ্চিত করুন"
              placeholder="পাসওয়ার্ড আবার দিন"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              leftIcon={<Lock size={18} />}
              togglePassword
              required
              error={
                confirm.length > 0 && password !== confirm
                  ? "পাসওয়ার্ড মিলছে না"
                  : undefined
              }
            />
            <Button
              type="submit"
              variant="primary"
              size={{ base: "md", md: "lg" }}
              fullWidth
              disabled={!canSubmit}
            >
              {busy ? "সেট করা হচ্ছে..." : "পাসওয়ার্ড সেট করুন"}
            </Button>
          </form>

          <Link
            href="/forgot-password"
            className="block text-center text-body-sm text-[var(--fg-muted)] hover:text-brand-700"
          >
            নতুন কোড দরকার?
          </Link>
        </>
      ) : (
        <div className="text-center space-y-3">
          <div className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-success-100 text-success-700 dark:bg-success-700/30 dark:text-success-300">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-h2 text-[var(--fg-primary)]">পাসওয়ার্ড আপডেট হয়েছে</h1>
          <p className="text-body text-[var(--fg-secondary)]">
            লগইন পেজে নিয়ে যাচ্ছি...
          </p>
        </div>
      )}
    </Shell>
  );
}
