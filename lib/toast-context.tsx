"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { clsx } from "@/lib/clsx";

export type ToastTone = "success" | "error" | "info";

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  durationMs: number;
}

export interface ToastContextValue {
  show: (input: { tone?: ToastTone; title: string; description?: string; durationMs?: number }) => string;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 3500;

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback<ToastContextValue["show"]>(
    ({ tone = "info", title, description, durationMs = DEFAULT_DURATION }) => {
      const id = randomId();
      setToasts((prev) => [...prev, { id, tone, title, description, durationMs }]);
      const timer = setTimeout(() => dismiss(id), durationMs);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  // Clean up timers on unmount.
  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (title, description) => show({ tone: "success", title, description }),
      error: (title, description) => show({ tone: "error", title, description }),
      info: (title, description) => show({ tone: "info", title, description }),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast() must be used within <ToastProvider>");
  return ctx;
}

// Internal viewport ------------------------------------------------------

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed z-[60] bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon =
    toast.tone === "success" ? CheckCircle2 : toast.tone === "error" ? AlertCircle : Info;

  const tone =
    toast.tone === "success"
      ? "bg-success-50 dark:bg-success-700/15 border-success-200 dark:border-success-700/40 text-success-800 dark:text-success-200"
      : toast.tone === "error"
      ? "bg-discount-50 dark:bg-discount-900/20 border-discount-200 dark:border-discount-700/40 text-discount-800 dark:text-discount-200"
      : "bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--fg-primary)]";

  const iconTone =
    toast.tone === "success"
      ? "text-success-700 dark:text-success-400"
      : toast.tone === "error"
      ? "text-discount-700 dark:text-discount-400"
      : "text-brand-700 dark:text-brand-400";

  return (
    <div
      role="status"
      className={clsx(
        "pointer-events-auto flex items-start gap-3 rounded-lg border shadow-card-hover px-4 py-3 max-w-sm w-full sm:w-96",
        tone,
      )}
    >
      <Icon size={20} className={clsx("flex-shrink-0 mt-0.5", iconTone)} />
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-semibold">{toast.title}</p>
        {toast.description && (
          <p className="text-caption mt-0.5 opacity-90">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="flex-shrink-0 w-6 h-6 inline-flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10"
      >
        <X size={14} />
      </button>
    </div>
  );
}
