"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, Monitor, Smartphone, Code, FileText } from "lucide-react";
import { clsx } from "@/lib/clsx";

interface TemplateEntry {
  key: string;
  label: string;
  description: string;
  subject: string;
}

type ViewMode = "desktop" | "mobile" | "html" | "text";

interface Props {
  entries: TemplateEntry[];
}

export function NotificationsPreview({ entries }: Props) {
  const [activeKey, setActiveKey] = useState<string>(entries[0]?.key ?? "");
  const [mode, setMode] = useState<ViewMode>("desktop");
  const [textBody, setTextBody] = useState<string>("");
  const [htmlSource, setHtmlSource] = useState<string>("");

  const active = useMemo(
    () => entries.find((e) => e.key === activeKey),
    [activeKey, entries],
  );

  const previewUrl = activeKey
    ? `/api/admin/notifications/preview/${encodeURIComponent(activeKey)}`
    : "";

  useEffect(() => {
    if (!activeKey) return;
    if (mode === "text") {
      fetch(`/api/admin/notifications/preview/${activeKey}?format=text`)
        .then((r) => r.text())
        .then(setTextBody)
        .catch(() => setTextBody("টেক্সট ভার্সন লোড করতে সমস্যা হয়েছে।"));
    } else if (mode === "html") {
      fetch(`/api/admin/notifications/preview/${activeKey}?format=json`)
        .then((r) => r.json())
        .then((d: { html: string }) => setHtmlSource(d.html))
        .catch(() => setHtmlSource("HTML সোর্স লোড করতে সমস্যা হয়েছে।"));
    }
  }, [activeKey, mode]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      {/* Sidebar — template list */}
      <aside className="space-y-2">
        <h2 className="text-h4 font-bold text-[var(--fg-primary)] mb-3 flex items-center gap-2">
          <Mail size={18} className="text-brand-700" />
          টেমপ্লেট
        </h2>
        <ul className="space-y-1">
          {entries.map((e) => {
            const isActive = e.key === activeKey;
            return (
              <li key={e.key}>
                <button
                  type="button"
                  onClick={() => setActiveKey(e.key)}
                  className={clsx(
                    "w-full text-left px-3 py-2.5 rounded-md border transition-colors",
                    isActive
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-700/20"
                      : "border-[var(--border-default)] hover:bg-[var(--bg-surface-muted)]",
                  )}
                >
                  <div
                    className={clsx(
                      "text-body-sm font-semibold",
                      isActive ? "text-brand-800 dark:text-brand-200" : "text-[var(--fg-primary)]",
                    )}
                  >
                    {e.label}
                  </div>
                  <div className="text-caption text-[var(--fg-muted)] line-clamp-2 mt-0.5 leading-relaxed">
                    {e.description}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main — preview */}
      <section className="min-w-0">
        {active && (
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
            {/* Header */}
            <div className="border-b border-[var(--border-muted)] p-4 flex flex-wrap gap-3 items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-caption uppercase tracking-wider text-[var(--fg-muted)] font-bold">
                  সাবজেক্ট
                </p>
                <p className="text-body font-semibold text-[var(--fg-primary)] truncate mt-0.5">
                  {active.subject}
                </p>
              </div>
              <div className="inline-flex items-center rounded-md border border-[var(--border-default)] overflow-hidden">
                <ModeButton
                  active={mode === "desktop"}
                  onClick={() => setMode("desktop")}
                  icon={<Monitor size={14} />}
                  label="ডেস্কটপ"
                />
                <ModeButton
                  active={mode === "mobile"}
                  onClick={() => setMode("mobile")}
                  icon={<Smartphone size={14} />}
                  label="মোবাইল"
                />
                <ModeButton
                  active={mode === "html"}
                  onClick={() => setMode("html")}
                  icon={<Code size={14} />}
                  label="HTML"
                />
                <ModeButton
                  active={mode === "text"}
                  onClick={() => setMode("text")}
                  icon={<FileText size={14} />}
                  label="টেক্সট"
                />
              </div>
            </div>

            {/* Body */}
            <div className="bg-[var(--bg-page)] p-4 sm:p-8 flex justify-center">
              {(mode === "desktop" || mode === "mobile") && (
                <iframe
                  key={`${activeKey}-${mode}`}
                  title={`Preview: ${active.label}`}
                  src={previewUrl}
                  className={clsx(
                    "bg-white shadow-card rounded-md transition-all",
                    mode === "desktop"
                      ? "w-full max-w-[680px] h-[820px]"
                      : "w-[375px] h-[700px]",
                  )}
                />
              )}
              {mode === "html" && (
                <pre className="w-full max-w-full overflow-x-auto bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-md p-4 text-caption font-mono leading-relaxed whitespace-pre-wrap break-all">
                  {htmlSource || "লোড হচ্ছে…"}
                </pre>
              )}
              {mode === "text" && (
                <pre className="w-full max-w-[680px] bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-md p-6 text-body-sm leading-relaxed whitespace-pre-wrap">
                  {textBody || "লোড হচ্ছে…"}
                </pre>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1.5 text-caption font-semibold transition-colors",
        active
          ? "bg-brand-600 text-white"
          : "text-[var(--fg-secondary)] hover:bg-[var(--bg-surface-muted)]",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
