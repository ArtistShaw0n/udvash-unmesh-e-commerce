"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/atoms";
import { FormField } from "@/components/molecules";

export default function SecurityPage() {
  const [data, setData] = useState({ current: "", next: "", confirm: "" });
  const matches = data.next.length >= 6 && data.next === data.confirm;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-[var(--fg-primary)]">সিকিউরিটি</h1>
        <p className="text-body text-[var(--fg-secondary)] mt-1">আপনার পাসওয়ার্ড পরিবর্তন করুন।</p>
      </div>

      <form
        className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-8 shadow-card space-y-5 max-w-xl"
        onSubmit={(e) => { e.preventDefault(); if (matches) alert("Password updated"); }}
      >
        <FormField
          id="current-pw"
          label="বর্তমান পাসওয়ার্ড"
          placeholder="বর্তমান পাসওয়ার্ড দিন"
          value={data.current}
          onChange={(e) => setData({ ...data, current: e.target.value })}
          leftIcon={<Lock size={18} />}
          togglePassword
        />
        <FormField
          id="new-pw"
          label="নতুন পাসওয়ার্ড"
          placeholder="কমপক্ষে ৬ অক্ষর"
          value={data.next}
          onChange={(e) => setData({ ...data, next: e.target.value })}
          leftIcon={<Lock size={18} />}
          togglePassword
        />
        <FormField
          id="confirm-pw"
          label="নতুন পাসওয়ার্ড নিশ্চিত করুন"
          placeholder="পাসওয়ার্ড আবার দিন"
          value={data.confirm}
          onChange={(e) => setData({ ...data, confirm: e.target.value })}
          leftIcon={<Lock size={18} />}
          togglePassword
          error={data.confirm.length > 0 && data.next !== data.confirm ? "পাসওয়ার্ড মিলছে না" : undefined}
        />
        <Button type="submit" variant="primary" disabled={!matches}>পাসওয়ার্ড আপডেট করুন</Button>
      </form>
    </div>
  );
}
