"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/atoms";
import { AddressCard, EmptyState, FormField, Modal } from "@/components/molecules";
import { MapPin } from "lucide-react";
import {
  useAuth,
  type AddressInput,
  type UserAddress,
} from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

const EMPTY: AddressInput = {
  label: "বাসা",
  recipientName: "",
  phone: "",
  line1: "",
  city: "",
  zip: "",
};

export default function AddressesPage() {
  const { user, addAddress, updateAddress, removeAddress, setDefaultAddress } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState<UserAddress | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<AddressInput>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressInput, string>>>({});
  const [confirmDelete, setConfirmDelete] = useState<UserAddress | null>(null);

  if (!user) return null;

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setCreating(true);
  }

  function openEdit(a: UserAddress) {
    setEditing(a);
    setForm({
      label: a.label,
      recipientName: a.recipientName,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      zip: a.zip,
    });
    setErrors({});
    setCreating(true);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
  }

  // Update one field + clear its error so the red outline lifts as
  // the user types a valid value (WCAG 3.3.1 / 3.3.3 — error suggestion).
  function setField<K extends keyof AddressInput>(key: K, value: AddressInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function save() {
    const errs: Partial<Record<keyof AddressInput, string>> = {};
    if (!form.recipientName.trim()) errs.recipientName = "প্রাপকের নাম দিন";
    if (!form.phone.trim()) errs.phone = "ফোন নাম্বার দিন";
    else if (!/^[\d\s+\-]{10,}$/.test(form.phone.trim()))
      errs.phone = "সঠিক ফোন নাম্বার দিন";
    if (!form.line1.trim()) errs.line1 = "ঠিকানা দিন";
    if (!form.city.trim()) errs.city = "শহর দিন";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("সব আবশ্যক ঘর পূরণ করুন");
      return;
    }
    setErrors({});
    if (editing) {
      await updateAddress(editing.id, form);
      toast.success("ঠিকানা আপডেট হয়েছে");
    } else {
      await addAddress(form);
      toast.success("ঠিকানা যোগ হয়েছে");
    }
    closeForm();
  }

  async function doDelete() {
    if (!confirmDelete) return;
    await removeAddress(confirmDelete.id);
    toast.success("ঠিকানা মুছে ফেলা হয়েছে");
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-h2 text-[var(--fg-primary)]">আমার ঠিকানা</h1>
          <p className="text-body text-[var(--fg-secondary)] mt-1">
            ডেলিভারি ঠিকানা যোগ ও পরিচালনা করুন।
          </p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openCreate}>
          নতুন ঠিকানা
        </Button>
      </div>

      {user.addresses.length > 0 ? (
        <div className="space-y-3">
          {user.addresses.map((a) => (
            <AddressCard
              key={a.id}
              address={a}
              onEdit={() => openEdit(a)}
              onDelete={() => setConfirmDelete(a)}
              onSetDefault={async () => {
                await setDefaultAddress(a.id);
                toast.success("ডিফল্ট সেট হয়েছে");
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<MapPin size={36} />}
          title="কোন ঠিকানা নেই"
          description="অর্ডারের জন্য ডেলিভারি ঠিকানা যোগ করুন।"
          cta={
            <Button variant="primary" onClick={openCreate} leftIcon={<Plus size={16} />}>
              নতুন ঠিকানা
            </Button>
          }
        />
      )}

      {/* Create / Edit modal */}
      <Modal
        open={creating}
        title={editing ? "ঠিকানা এডিট করুন" : "নতুন ঠিকানা"}
        onClose={closeForm}
      >
          <FormField
            id="addr-label"
            label="লেবেল"
            value={form.label}
            onChange={(e) => setField("label", e.target.value)}
            placeholder="বাসা / অফিস"
          />
          <FormField
            id="addr-name"
            label="প্রাপকের নাম"
            value={form.recipientName}
            onChange={(e) => setField("recipientName", e.target.value)}
            error={errors.recipientName}
            required
            aria-required="true"
            autoComplete="name"
          />
          <FormField
            id="addr-phone"
            label="ফোন"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            placeholder="০১XXXXXXXXX"
            error={errors.phone}
            required
            aria-required="true"
            type="tel"
            autoComplete="tel"
          />
          <FormField
            id="addr-line1"
            label="ঠিকানা"
            value={form.line1}
            onChange={(e) => setField("line1", e.target.value)}
            placeholder="বাড়ি, রোড, এলাকা"
            error={errors.line1}
            required
            aria-required="true"
            autoComplete="street-address"
          />
          <FormField
            id="addr-city"
            label="শহর"
            value={form.city}
            onChange={(e) => setField("city", e.target.value)}
            error={errors.city}
            required
            aria-required="true"
            autoComplete="address-level2"
          />
          <FormField
            id="addr-zip"
            label="পোস্ট কোড"
            value={form.zip ?? ""}
            onChange={(e) => setField("zip", e.target.value)}
            autoComplete="postal-code"
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={closeForm}>বাতিল</Button>
            <Button variant="primary" onClick={save}>সেভ করুন</Button>
          </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!confirmDelete}
        title="ঠিকানা মুছবেন?"
        onClose={() => setConfirmDelete(null)}
      >
        <p className="text-body-sm text-[var(--fg-secondary)]">
          <span className="font-semibold text-[var(--fg-primary)]">{confirmDelete?.label}</span>{" "}
          ঠিকানাটি মুছে ফেলা হবে। এটি ফিরিয়ে আনা যাবে না।
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>বাতিল</Button>
          <Button variant="danger" onClick={doDelete}>মুছে ফেলুন</Button>
        </div>
      </Modal>
    </div>
  );
}

