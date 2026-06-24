"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  variant: ToastVariant;
  message: string;
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface ToastContextValue {
  addToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

// ─── Styling ─────────────────────────────────────────────────────────────────

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: "bg-green-600 text-white",
  error: "bg-error text-white",
  info: "bg-blue-600 text-white",
  warning: "bg-amber-500 text-white",
};

const VARIANT_ICONS: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "⚠",
};

// ─── Single toast item ────────────────────────────────────────────────────────

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onRemove(toast.id), 4000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, onRemove]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-label-md",
        "w-72 max-w-[calc(100vw-2rem)]",
        VARIANT_CLASSES[toast.variant],
      ].join(" ")}
    >
      <span className="shrink-0 text-base">{VARIANT_ICONS[toast.variant]}</span>
      <p className="flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 opacity-70 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => {
        const next = [...prev, { id, variant, message }];
        // Max 3 stacked
        return next.length > 3 ? next.slice(-3) : next;
      });
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Portal: top-right corner */}
      <div
        className="fixed right-4 top-4 z-[100] flex flex-col gap-2"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
