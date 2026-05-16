"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Phone, Lock, User } from "lucide-react";
import { Button } from "@/components/atoms";
import { FormField, SocialLoginButton } from "@/components/molecules";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { clsx } from "@/lib/clsx";

export interface AuthCardProps {
  mode: "signup" | "login";
  className?: string;
}

export function AuthCard(props: AuthCardProps) {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <AuthCardInner {...props} />
    </Suspense>
  );
}

function AuthCardSkeleton() {
  return (
    <section className="section-pad-sm">
      <div className="container-site flex justify-center">
        <div className="w-full max-w-md rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card p-6 sm:p-8 min-h-[480px]" />
      </div>
    </section>
  );
}

function AuthCardInner({ mode, className }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const { login, signup } = useAuth();
  const toast = useToast();

  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isSignup = mode === "signup";
  const title = isSignup ? "সাইন আপ করুন" : "লগইন করুন";
  const subtitle = isSignup
    ? "নতুন একাউন্ট তৈরি করে কেনাকাটা শুরু করুন"
    : "আপনার একাউন্টে প্রবেশ করুন";
  const submitLabel = isSignup ? "সাইন আপ করুন" : "লগইন করুন";

  function handle(field: keyof typeof data) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setData((d) => ({ ...d, [field]: e.target.value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    if (isSignup) {
      if (data.password !== data.confirm) {
        setError("পাসওয়ার্ড দুটি মিলছে না");
        setPending(false);
        return;
      }
      const result = signup({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      setPending(false);
      if (!result.ok) {
        setError(result.error ?? "সাইন আপ ব্যর্থ");
        return;
      }
      toast.success(
        "একাউন্ট তৈরি হয়েছে",
        "ইমেইল ভেরিফাই করতে কোড দিন।",
      );
      router.push(`/verify-email?next=${encodeURIComponent(next)}`);
    } else {
      const result = login(data.email, data.password);
      setPending(false);
      if (!result.ok) {
        setError(result.error ?? "লগইন ব্যর্থ");
        return;
      }
      toast.success("সফলভাবে লগইন হয়েছে");
      router.push(next);
    }
  }

  return (
    <section className="section-pad-sm">
      <div className="container-site flex justify-center">
        <div
          className={clsx(
            "w-full max-w-md rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card p-6 sm:p-8 space-y-6",
            className,
          )}
        >
          <div className="text-center space-y-1">
            <h1 className="text-h2 text-[var(--fg-primary)]">{title}</h1>
            <p className="text-body-sm text-[var(--fg-secondary)]">{subtitle}</p>
          </div>

          {next !== "/account" && (
            <div className="rounded-md bg-brand-50 dark:bg-brand-700/15 border border-brand-100 dark:border-brand-700/30 px-3 py-2">
              <p className="text-caption text-brand-800 dark:text-brand-300">
                {isSignup ? "একাউন্ট তৈরির পর" : "লগইনের পর"} আপনি{" "}
                <span className="font-semibold">{next}</span> এ ফিরে যাবেন।
              </p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-md bg-discount-50 dark:bg-discount-900/20 border border-discount-200 dark:border-discount-700/40 px-3 py-2 text-body-sm text-discount-800 dark:text-discount-200"
            >
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={onSubmit}>
            {isSignup && (
              <FormField
                id="name"
                label="পুরো নাম"
                placeholder="আপনার পুরো নাম দিন"
                value={data.name}
                onChange={handle("name")}
                leftIcon={<User size={18} />}
                autoComplete="name"
                required
              />
            )}
            <FormField
              id="email"
              type="email"
              label="ইমেইল"
              placeholder="আপনার ইমেইল দিন"
              value={data.email}
              onChange={handle("email")}
              leftIcon={<Mail size={18} />}
              autoComplete="email"
              required
            />
            {isSignup && (
              <FormField
                id="phone"
                type="tel"
                label="ফোন নাম্বার"
                placeholder="০১XXXXXXXXX"
                value={data.phone}
                onChange={handle("phone")}
                leftIcon={<Phone size={18} />}
                autoComplete="tel"
              />
            )}
            <FormField
              id="password"
              label="পাসওয়ার্ড"
              placeholder="কমপক্ষে ৬ অক্ষর"
              value={data.password}
              onChange={handle("password")}
              leftIcon={<Lock size={18} />}
              togglePassword
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
            />
            {isSignup && (
              <FormField
                id="confirm"
                label="পাসওয়ার্ড নিশ্চিত করুন"
                placeholder="পাসওয়ার্ড আবার দিন"
                value={data.confirm}
                onChange={handle("confirm")}
                leftIcon={<Lock size={18} />}
                togglePassword
                autoComplete="new-password"
                required
              />
            )}

            {!isSignup && (
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-body-sm text-brand-700 dark:text-brand-400 hover:underline font-semibold"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </Link>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={pending}>
              {pending ? "অপেক্ষা করুন..." : submitLabel}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <span className="w-full border-t border-[var(--border-default)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--bg-surface)] px-3 text-body-sm text-[var(--fg-muted)]">অথবা</span>
            </div>
          </div>

          <div className="space-y-3">
            <SocialLoginButton provider="google" />
            <SocialLoginButton provider="facebook" />
          </div>

          <p className="text-center text-body-sm text-[var(--fg-secondary)]">
            {isSignup ? "আগে থেকেই একাউন্ট আছে? " : "একাউন্ট নেই? "}
            <Link
              href={`${isSignup ? "/login" : "/signup"}${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-semibold text-brand-700 dark:text-brand-400 hover:underline"
            >
              {isSignup ? "লগইন করুন" : "সাইন আপ করুন"}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
