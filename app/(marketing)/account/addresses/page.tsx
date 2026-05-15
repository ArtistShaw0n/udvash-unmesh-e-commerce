"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/atoms";
import { AddressCard, type Address } from "@/components/molecules";

const SAMPLE: Address[] = [
  {
    id: "1",
    label: "বাসা",
    recipientName: "Shawon Ahmed",
    phone: "01798214677",
    line1: "হাউজ ৭১, রোড ৪, ব্লক সি",
    city: "বনশ্রী, ঢাকা",
    zip: "১২১৯",
    isDefault: true,
  },
  {
    id: "2",
    label: "অফিস",
    recipientName: "Shawon Ahmed",
    phone: "01798214677",
    line1: "ধানমন্ডি ২৭, রোড ১১",
    city: "ঢাকা",
    zip: "১২০৭",
  },
];

export default function AddressesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-h2 text-[var(--fg-primary)]">আমার ঠিকানা</h1>
          <p className="text-body text-[var(--fg-secondary)] mt-1">ডেলিভারি ঠিকানা যোগ ও পরিচালনা করুন।</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={16} />}>নতুন ঠিকানা</Button>
      </div>

      <div className="space-y-3">
        {SAMPLE.map((a) => (
          <AddressCard
            key={a.id}
            address={a}
            onEdit={() => alert("Edit " + a.id)}
            onDelete={() => alert("Delete " + a.id)}
          />
        ))}
      </div>
    </div>
  );
}
