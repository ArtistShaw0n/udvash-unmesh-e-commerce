"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

export default function SecurityPage() {
  const { changePassword } = useAuth();
  const toast = useToast();
  const [data, setData] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);

  const matches = data.next.length >= 6 && data.next === data.confirm;
  const canSubmit = matches && data.current.length >= 6;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = changePassword(data.current, data.next);
    if (!result.ok) {
      setError(result.error ?? "পাসওয়ার্ড আপডেট ব্যর্থ");
      return;
    }
    toast.success("পাসওয়ার্ড আপডেট হয়েছে");
    setData({ current: "", next: "", confirm: "" });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-[var(--fg-primary)]">সিকিউরিটি</h1>
        <p className="text-body text-[var(--fg-secondary)] mt-1">
          আপনার পাসওয়ার্ড পরিবর্তন করুন।
        </p>
      </div>

      <form
        className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-8 shadow-card space-y-5 max-w-xl"
        onSubmit={submit}
      >
        {error && (
          <div className="rounded-md bg-discount-50 dark:bg-discount-900/20 border border-discount-200 dark:border-discount-700/40 px-3 py-2 text-body-sm text-discount-800 dark:text-discount-200">
            {error}
          </div>
        )}

        <FormField
          id="current-pw"
          label="বর্তমান পাসওয়ার্ড"
          placeholder="বর্তমান পাসওয়ার্ড দিন"
          value={data.current}
          onChange={(e) => setData({ ...data, current: e.target.value })}
          leftIcon={<Lock size={18} />}
          togglePassword
          autoComplete="current-password"
        />
        <FormField
          id="new-pw"
          label="নতুন পাসওয়ার্ড"
          placeholder="কমপক্ষে ৬ অক্ষর"
          value={data.next}
          onChange={(e) => setData({ ...data, next: e.target.value })}
          leftIcon={<Lock size={18} />}
          togglePassword
          autoComplete="new-password"
        />
        <FormField
          id="confirm-pw"
          label="নতুন পাসওয়ার্ড নিশ্চিত করুন"
          placeholder="পাসওয়ার্ড আবার দিন"
          value={data.confirm}
          onChange={(e) => setData({ ...data, confirm: e.target.value })}
          leftIcon={<Lock size={18} />}
          togglePassword
          autoComplete="new-password"
          error={data.confirm.length > 0 && data.next !== data.confirm ? "পাসওয়ার্ড মিলছে না" : undefined}
        />
        <Button type="submit" variant="primary" disabled={!canSubmit}>
          পাসওয়ার্ড আপডেট করুন
        </Button>
      </form>
    </div>
  );
}
