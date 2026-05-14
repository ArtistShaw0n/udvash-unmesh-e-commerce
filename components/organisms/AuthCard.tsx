"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, Lock, User } from "lucide-react";
import { Button } from "@/components/atoms";
import { FormField, SocialLoginButton } from "@/components/molecules";
import { clsx } from "@/lib/clsx";

export interface AuthCardProps {
  mode: "signup" | "login";
  className?: string;
}

export function AuthCard({ mode, className }: AuthCardProps) {
  const [data, setData] = useState({
    name: "", email: "", phone: "", password: "", confirm: "",
  });

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

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {isSignup && (
              <FormField
                id="name"
                label="পুরো নাম"
                placeholder="আপনার পুরো নাম দিন"
                value={data.name}
                onChange={handle("name")}
                leftIcon={<User size={18} />}
                autoComplete="name"
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
              />
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth>
              {submitLabel}
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
            <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-brand-700 dark:text-brand-400 hover:underline">
              {isSignup ? "লগইন করুন" : "সাইন আপ করুন"}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
