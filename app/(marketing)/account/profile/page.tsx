"use client";

import { useState } from "react";
import { User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/atoms";
import { FormField } from "@/components/molecules";

export default function ProfilePage() {
  const [data, setData] = useState({
    name: "Shawon Ahmed",
    email: "uiux1.opl@gmail.com",
    phone: "01798214677",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-[var(--fg-primary)]">প্রোফাইল</h1>
        <p className="text-body text-[var(--fg-secondary)] mt-1">আপনার ব্যক্তিগত তথ্য এডিট করুন।</p>
      </div>

      <form
        className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-8 shadow-card space-y-5 max-w-xl"
        onSubmit={(e) => e.preventDefault()}
      >
        <FormField
          id="name"
          label="পুরো নাম"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          leftIcon={<User size={18} />}
        />
        <FormField
          id="email"
          type="email"
          label="ইমেইল"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          leftIcon={<Mail size={18} />}
        />
        <FormField
          id="phone"
          type="tel"
          label="ফোন নাম্বার"
          value={data.phone}
          onChange={(e) => setData({ ...data, phone: e.target.value })}
          leftIcon={<Phone size={18} />}
        />
        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary">সেভ করুন</Button>
          <Button variant="secondary">বাতিল</Button>
        </div>
      </form>
    </div>
  );
}
