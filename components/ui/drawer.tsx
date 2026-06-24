"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  width = "w-full sm:w-80",
}: DrawerProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel — right slide-in on desktop, bottom sheet on mobile */}
      <aside
        role="dialog"
        aria-modal
        aria-label={title}
        className={[
          "relative flex h-full flex-col bg-surface shadow-xl",
          "w-full sm:max-w-xs",
          width,
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-outline-variant px-4 py-3.5">
          {title && (
            <h2 className="font-display text-title-md text-on-surface">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 border-t border-outline-variant px-4 py-3">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
}
