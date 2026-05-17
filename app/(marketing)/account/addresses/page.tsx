"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/atoms";
import { AddressCard, EmptyState, FormField } from "@/components/molecules";
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
  const [confirmDelete, setConfirmDelete] = useState<UserAddress | null>(null);

  if (!user) return null;

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
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
    setCreating(true);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
    setForm(EMPTY);
  }

  async function save() {
    if (!form.recipientName.trim() || !form.phone.trim() || !form.line1.trim() || !form.city.trim()) {
      toast.error("সব ঘর পূরণ করুন");
      return;
    }
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
      {creating && (
        <Modal
          title={editing ? "ঠিকানা এডিট করুন" : "নতুন ঠিকানা"}
          onClose={closeForm}
        >
          <FormField
            id="addr-label"
            label="লেবেল"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="বাসা / অফিস"
          />
          <FormField
            id="addr-name"
            label="প্রাপকের নাম"
            value={form.recipientName}
            onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
          />
          <FormField
            id="addr-phone"
            label="ফোন"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="০১XXXXXXXXX"
          />
          <FormField
            id="addr-line1"
            label="ঠিকানা"
            value={form.line1}
            onChange={(e) => setForm({ ...form, line1: e.target.value })}
            placeholder="বাড়ি, রোড, এলাকা"
          />
          <FormField
            id="addr-city"
            label="শহর"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <FormField
            id="addr-zip"
            label="পোস্ট কোড"
            value={form.zip ?? ""}
            onChange={(e) => setForm({ ...form, zip: e.target.value })}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={closeForm}>বাতিল</Button>
            <Button variant="primary" onClick={save}>সেভ করুন</Button>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <Modal title="ঠিকানা মুছবেন?" onClose={() => setConfirmDelete(null)}>
          <p className="text-body-sm text-[var(--fg-secondary)]">
            <span className="font-semibold text-[var(--fg-primary)]">{confirmDelete.label}</span>{" "}
            ঠিকানাটি মুছে ফেলা হবে। এটি ফিরিয়ে আনা যাবে না।
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>বাতিল</Button>
            <Button variant="danger" onClick={doDelete}>মুছে ফেলুন</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-md bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-card-hover p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-h3 text-[var(--fg-primary)]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 inline-flex items-center justify-center rounded-md text-[var(--fg-muted)] hover:bg-[var(--bg-surface-muted)]"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
