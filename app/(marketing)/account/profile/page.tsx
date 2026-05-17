"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone ?? "");
      setDirty(false);
    }
  }, [user]);

  if (!user) return null;

  function reset() {
    setName(user!.name);
    setPhone(user!.phone ?? "");
    setDirty(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("নাম দিন");
      return;
    }
    const result = await updateProfile({
      name: name.trim(),
      phone: phone.trim() || undefined,
    });
    if (!result.ok) {
      toast.error(result.error ?? "আপডেট ব্যর্থ");
      return;
    }
    setDirty(false);
    toast.success("প্রোফাইল আপডেট হয়েছে");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-[var(--fg-primary)]">প্রোফাইল</h1>
        <p className="text-body text-[var(--fg-secondary)] mt-1">
          আপনার ব্যক্তিগত তথ্য এডিট করুন।
        </p>
      </div>

      <form
        className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-8 shadow-card space-y-5 max-w-xl"
        onSubmit={save}
      >
        <FormField
          id="name"
          label="পুরো নাম"
          value={name}
          onChange={(e) => { setName(e.target.value); setDirty(true); }}
          leftIcon={<User size={18} />}
          required
        />
        <FormField
          id="email"
          type="email"
          label="ইমেইল"
          value={user.email}
          leftIcon={<Mail size={18} />}
          readOnly
          disabled
          help="ইমেইল পরিবর্তন করতে সাপোর্টে যোগাযোগ করুন।"
        />
        <FormField
          id="phone"
          type="tel"
          label="ফোন নাম্বার"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setDirty(true); }}
          leftIcon={<Phone size={18} />}
          placeholder="০১XXXXXXXXX"
        />
        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" disabled={!dirty}>
            সেভ করুন
          </Button>
          <Button type="button" variant="secondary" onClick={reset} disabled={!dirty}>
            বাতিল
          </Button>
        </div>
      </form>
    </div>
  );
}
