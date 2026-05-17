"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/atoms";
import { FormField } from "@/components/molecules";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const matches = password.length >= 6 && password === confirm;

  return (
    <section className="section-pad-sm">
      <div className="container-site flex justify-center">
        <div className="w-full max-w-md rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card p-6 sm:p-8 space-y-6">
          {!done ? (
            <>
              <div className="text-center space-y-2">
                <div className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300">
                  <Lock size={26} />
                </div>
                <h1 className="text-h2 text-[var(--fg-primary)]">নতুন পাসওয়ার্ড</h1>
                <p className="text-body-sm text-[var(--fg-secondary)]">
                  আপনার নতুন পাসওয়ার্ড সেট করুন।
                </p>
              </div>

              <form
                className="space-y-4"
                onSubmit={(e) => { e.preventDefault(); if (matches) setDone(true); }}
              >
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
                  error={confirm.length > 0 && password !== confirm ? "পাসওয়ার্ড মিলছে না" : undefined}
                />
                <Button type="submit" variant="primary" size={{ base: "md", md: "lg" }} fullWidth disabled={!matches}>
                  পাসওয়ার্ড সেট করুন
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-3">
              <div className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-success-100 text-success-700 dark:bg-success-700/30 dark:text-success-300">
                <CheckCircle2 size={32} />
              </div>
              <h1 className="text-h2 text-[var(--fg-primary)]">পাসওয়ার্ড আপডেট হয়েছে</h1>
              <p className="text-body text-[var(--fg-secondary)]">
                এখন নতুন পাসওয়ার্ড দিয়ে লগইন করতে পারবেন।
              </p>
              <Button href="/login" variant="primary" size={{ base: "md", md: "lg" }} fullWidth>লগইন করুন</Button>
              <Link href="/" className="block text-body-sm text-[var(--fg-muted)] hover:text-brand-700">
                হোমে ফিরে যান
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
