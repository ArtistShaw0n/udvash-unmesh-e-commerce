import { templates } from "@/lib/server/email-templates";
import { NotificationsPreview } from "./_preview";

export const metadata = { title: "নোটিফিকেশন প্রিভিউ" };

export default function Page() {
  // Render each template once on the server to get the subject for display.
  // The iframes fetch the full body via the route handler on demand.
  const entries = templates.map((t) => {
    const r = t.render();
    return {
      key: t.key,
      label: t.label,
      description: t.description,
      subject: r.subject,
    };
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-h2 font-bold text-[var(--fg-primary)]">নোটিফিকেশন প্রিভিউ</h1>
        <p className="text-body text-[var(--fg-secondary)] mt-1">
          গ্রাহকের কাছে কী চেহারায় পৌঁছাবে দেখে নিন। স্যাম্পল ডেটা দিয়ে রেন্ডার হচ্ছে।
        </p>
      </header>
      <NotificationsPreview entries={entries} />
    </div>
  );
}
