"use client";

import { useRef, useState } from "react";
import {
  Bell,
  Car,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  MoreVertical,
  Pause,
  Pencil,
  Play,
  Shield,
  Star,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  completeReminderOccurrence,
  deleteReminder,
  pauseReminder,
  resumeReminder,
} from "@/lib/api/reminders";
import type { Reminder, ReminderCategory, ReminderStatus } from "@/lib/api/types";

// ─── Category → icon ──────────────────────────────────────────────────────────

const CATEGORY_ICON: Record<ReminderCategory, LucideIcon> = {
  bill: Bell,
  health: Heart,
  vehicle: Car,
  insurance: Shield,
  subscription: FileText,
  tax: FileText,
  personal: Star,
  work: Clock,
  family: Star,
  custom: Star,
};

// ─── Status badge ─────────────────────────────────────────────────────────────

function getDueBadge(reminder: Reminder): {
  label: string;
  className: string;
} {
  const { status, next_run_at } = reminder;

  if (status === "completed")
    return { label: "COMPLETED", className: "bg-surface-container text-on-surface-variant" };
  if (status === "paused")
    return { label: "PAUSED", className: "bg-surface-container text-on-surface-variant" };
  if (status === "cancelled")
    return { label: "CANCELLED", className: "bg-surface-container text-on-surface-variant" };

  const diffMs = new Date(next_run_at).getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "OVERDUE", className: "bg-error-container text-error" };
  if (diffDays <= 3)
    return { label: `DUE IN ${diffDays}D`, className: "bg-amber-100 text-amber-700" };
  return { label: "UPCOMING", className: "bg-primary/10 text-primary" };
}

// ─── Recurrence description ───────────────────────────────────────────────────

function recurrenceLabel(reminder: Reminder): string {
  const { recurrence_type, recurrence_rule, next_run_at } = reminder;
  const date = new Date(next_run_at);

  switch (recurrence_type) {
    case "once":
      return `One-time, ${date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
    case "daily":
      return "Every day";
    case "weekly": {
      const day = date.toLocaleDateString("en-GB", { weekday: "long" });
      return `Every ${day}`;
    }
    case "monthly":
      return `Every month on the ${date.getDate()}${getOrdinal(date.getDate())}`;
    case "yearly":
      return `Every year on ${date.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
    case "custom_interval": {
      const days =
        (recurrence_rule as { interval_days?: number } | null | undefined)
          ?.interval_days ?? "?";
      return `Every ${days} days`;
    }
    default:
      return recurrence_type;
  }
}

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// ─── 3-dot Menu ───────────────────────────────────────────────────────────────

interface MenuAction {
  icon: LucideIcon;
  label: string;
  className?: string;
  onClick: () => void;
}

function ActionMenu({
  actions,
  onClose,
}: {
  actions: MenuAction[];
  onClose: () => void;
}) {
  return (
    <div className="absolute right-0 top-8 z-10 min-w-[140px] rounded-lg border border-outline-variant bg-surface-container-lowest py-1 shadow-lg">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.label}
            onClick={() => {
              a.onClick();
              onClose();
            }}
            className={[
              "flex w-full items-center gap-2 px-4 py-2.5 text-label-md hover:bg-surface-container",
              a.className ?? "text-on-surface",
            ].join(" ")}
          >
            <Icon size={16} />
            {a.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── ReminderCard ─────────────────────────────────────────────────────────────

interface ReminderCardProps {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
}

export function ReminderCard({ reminder, onEdit }: ReminderCardProps) {
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["reminders"] });

  const pauseMutation = useMutation({
    mutationFn: () => pauseReminder(reminder.id),
    onSuccess: invalidate,
  });
  const resumeMutation = useMutation({
    mutationFn: () => resumeReminder(reminder.id),
    onSuccess: invalidate,
  });
  const completeMutation = useMutation({
    mutationFn: () => completeReminderOccurrence(reminder.id),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteReminder(reminder.id),
    onSuccess: invalidate,
  });

  const Icon = CATEGORY_ICON[reminder.category] ?? Bell;
  const badge = getDueBadge(reminder);

  const isActive = reminder.status === "active";

  const menuActions: MenuAction[] = [
    { icon: Pencil, label: "Edit", onClick: () => onEdit(reminder) },
    isActive
      ? { icon: Pause, label: "Pause", onClick: () => pauseMutation.mutate() }
      : { icon: Play, label: "Resume", onClick: () => resumeMutation.mutate() },
    {
      icon: CheckCircle2,
      label: "Mark Done",
      onClick: () => completeMutation.mutate(),
    },
    {
      icon: Trash2,
      label: "Delete",
      className: "text-error",
      onClick: () => {
        if (confirm(`Delete "${reminder.title}"?`)) deleteMutation.mutate();
      },
    },
  ];

  return (
    <div
      className="relative flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-4 transition-shadow hover:shadow-md"
      onMouseLeave={() => setMenuOpen(false)}
    >
      {/* Top row: category icon + status badge + 3-dot menu */}
      <div className="mb-3 flex items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <Icon size={18} className="text-primary" />
        </span>

        <div className="flex items-center gap-2">
          <span
            className={[
              "rounded-full px-2 py-0.5 text-label-sm font-medium",
              badge.className,
            ].join(" ")}
          >
            {badge.label}
          </span>

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((p) => !p)}
              aria-label="Actions"
              className="flex h-7 w-7 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <ActionMenu
                actions={menuActions}
                onClose={() => setMenuOpen(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Title (2-line clamp) */}
      <p className="mb-1 line-clamp-2 font-display text-title-lg text-on-surface">
        {reminder.title}
      </p>

      {/* Recurrence */}
      <p className="mb-3 text-label-md text-on-surface-variant">
        {recurrenceLabel(reminder)}
      </p>

      {/* Next run */}
      <div className="mt-auto flex items-center gap-1 text-label-sm text-on-surface-variant">
        <Clock size={13} />
        <span>
          Next:{" "}
          {new Date(reminder.next_run_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
