"use client";

import { useState } from "react";
import { Bell, BellRing, Mail } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { FormField } from "./FormField";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

const STORAGE_KEY = "udvash:notify-me-v1";

interface NotifySubscription {
  slug: string;
  email: string;
  subscribedAt: number;
}

function readSubs(): NotifySubscription[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSubs(subs: NotifySubscription[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
}

export interface NotifyMeFormProps {
  slug: string;
}

/**
 * "Notify me when back in stock" form. Shown only on out-of-stock products.
 * Stores subscriptions in localStorage — backend would email when stock returns.
 */
export function NotifyMeForm({ slug }: NotifyMeFormProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState(user?.email ?? "");
  const [subscribed, setSubscribed] = useState(() => {
    if (typeof window === "undefined") return false;
    return readSubs().some((s) => s.slug === slug && (user ? s.email === user.email : false));
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("সঠিক ইমেইল দিন");
      return;
    }
    const subs = readSubs();
    if (subs.some((s) => s.slug === slug && s.email === email)) {
      toast.info("আপনি ইতিমধ্যে সাবস্ক্রাইব করেছেন");
      setSubscribed(true);
      return;
    }
    writeSubs([...subs, { slug, email, subscribedAt: Date.now() }]);
    setSubscribed(true);
    toast.success("সাবস্ক্রাইব সফল", "স্টকে এলে আপনাকে ইমেইল করব।");
  }

  if (subscribed) {
    return (
      <div className="rounded-md border border-success-200 dark:border-success-700/40 bg-success-50 dark:bg-success-700/15 p-4 flex items-start gap-3">
        <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-300 flex-shrink-0">
          <BellRing size={18} />
        </span>
        <div>
          <p className="text-body-sm font-semibold text-success-800 dark:text-success-200">
            স্টকে এলে আপনাকে জানাবো
          </p>
          <p className="text-caption text-success-700 dark:text-success-300 mt-0.5">
            <span className="font-mono">{email}</span> এ ইমেইল পাবেন।
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface-muted)] p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <Bell size={18} className="text-brand-700 dark:text-brand-400" />
        <p className="text-body-sm font-semibold text-[var(--fg-primary)]">
          স্টকে এলে আমাকে জানান
        </p>
      </div>
      <FormField
        id="notify-email"
        type="email"
        label="ইমেইল"
        placeholder="আপনার ইমেইল দিন"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail size={16} />}
        required
      />
      <Button type="submit" variant="primary" size="sm" fullWidth>
        সাবস্ক্রাইব করুন
      </Button>
    </form>
  );
}
