"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, MailCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/atoms";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

export function VerifyEmailForm() {
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
        <div className="w-full max-w-md rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card p-6 sm:p-8 min-h-[420px]">
          {children}
        </div>
      </div>
    </section>
  );
}

function Inner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";

  const { user, hydrated, verifyEmail } = useAuth();
  const toast = useToast();

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // Already verified → bounce immediately.
  useEffect(() => {
    if (hydrated && user?.emailVerified) {
      router.replace(next);
    }
  }, [hydrated, user, next, router]);

  // Resend cooldown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  function setDigit(idx: number, value: string) {
    const clean = value.replace(/\D/g, "").slice(0, 1);
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = clean;
      return next;
    });
    if (clean && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  }

  function onKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) inputsRef.current[idx + 1]?.focus();
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 0) return;
    e.preventDefault();
    const arr = text.split("");
    setDigits(["", "", "", "", "", ""].map((_, i) => arr[i] ?? ""));
    inputsRef.current[Math.min(text.length, 5)]?.focus();
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const code = digits.join("");
    const result = verifyEmail(code);
    if (!result.ok) {
      setError(result.error ?? "ভুল কোড");
      return;
    }
    setDone(true);
    toast.success("ইমেইল ভেরিফাইড", "আপনার একাউন্ট সফলভাবে সক্রিয় হয়েছে।");
    setTimeout(() => router.push(next), 1200);
  }

  function resend() {
    setResendTimer(30);
    toast.info("নতুন কোড পাঠানো হয়েছে", "ইমেইল ইনবক্স চেক করুন।");
  }

  if (done) {
    return (
      <Shell>
        <div className="text-center space-y-3 py-6">
          <div className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-success-100 text-success-700 dark:bg-success-700/30 dark:text-success-300">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-h2 text-[var(--fg-primary)]">ইমেইল ভেরিফাইড ✓</h1>
          <p className="text-body text-[var(--fg-secondary)]">
            রিডিরেক্ট করা হচ্ছে...
          </p>
        </div>
      </Shell>
    );
  }

  if (hydrated && !user) {
    return (
      <Shell>
        <div className="text-center space-y-4 py-6">
          <h1 className="text-h2 text-[var(--fg-primary)]">আগে সাইন আপ করুন</h1>
          <p className="text-body text-[var(--fg-secondary)]">
            ইমেইল ভেরিফাই করতে আগে একাউন্ট তৈরি করুন।
          </p>
          <Button href="/signup" variant="primary" fullWidth>সাইন আপ করুন</Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300">
            <MailCheck size={26} />
          </div>
          <h1 className="text-h2 text-[var(--fg-primary)]">ইমেইল ভেরিফাই করুন</h1>
          <p className="text-body-sm text-[var(--fg-secondary)]">
            <span className="font-semibold text-[var(--fg-primary)]">{user?.email ?? "..."}</span>{" "}
            এ একটি ৬ ডিজিটের কোড পাঠানো হয়েছে।
          </p>
          <p className="text-caption text-[var(--fg-muted)] flex items-center justify-center gap-1.5 pt-1">
            <ShieldCheck size={14} /> ডেমো: কোড <span className="font-bold tabular-nums">123456</span>
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

        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={onPaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                inputMode="numeric"
                maxLength={1}
                aria-label={`Digit ${i + 1}`}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-h3 font-bold rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--fg-primary)] tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            ))}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={digits.some((d) => !d)}
          >
            ভেরিফাই করুন
          </Button>
        </form>

        <div className="text-center text-body-sm text-[var(--fg-secondary)]">
          কোড পাননি?{" "}
          {resendTimer > 0 ? (
            <span className="text-[var(--fg-muted)]">
              আবার পাঠান ({resendTimer}s)
            </span>
          ) : (
            <button
              type="button"
              onClick={resend}
              className="font-semibold text-brand-700 dark:text-brand-400 hover:underline"
            >
              আবার পাঠান
            </button>
          )}
        </div>

        <Link
          href="/account"
          className="block text-center text-caption text-[var(--fg-muted)] hover:text-brand-700"
        >
          পরে করুন
        </Link>
      </div>
    </Shell>
  );
}
