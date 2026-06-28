"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bell,
  Calendar,
  CreditCard,
  FileText,
  Loader2,
  Plus,
  Target,
} from "lucide-react";

import { useAuth } from "@/lib/auth/useAuth";
import { listReminders } from "@/lib/api/reminders";
import { listDocuments } from "@/lib/api/documents";
import { listSubscriptions } from "@/lib/api/subscriptions";
import { getTimeline } from "@/lib/api/timeline";
import { listNotifications } from "@/lib/api/notifications";
import type { TimelineItem, Notification } from "@/lib/api/types";

// ─── Greeting helpers ─────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Date formatting ──────────────────────────────────────────────────────────

function formatDueDate(iso: string): string {
  const now = new Date();
  const due = new Date(iso);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `In ${diffDays} days`;
  return due.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatNotificationDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Type → accent colour ─────────────────────────────────────────────────────

const TIMELINE_ACCENT: Record<TimelineItem["type"], string> = {
  reminder: "border-l-primary bg-primary/5",
  document: "border-l-secondary bg-secondary/5",
  subscription: "border-l-amber-500 bg-amber-50",
  goal: "border-l-teal-500 bg-teal-50",
};

const TIMELINE_BADGE: Record<TimelineItem["type"], string> = {
  reminder: "bg-primary/10 text-primary",
  document: "bg-secondary/10 text-secondary",
  subscription: "bg-amber-100 text-amber-700",
  goal: "bg-teal-100 text-teal-700",
};

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  iconBg: string;
  isLoading?: boolean;
}

function StatCard({ label, value, subValue, icon, iconBg, isLoading }: StatCardProps) {
  return (
    <div className="relative flex flex-col gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
      {/* Icon top-right */}
      <span
        className={[
          "absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full",
          iconBg,
        ].join(" ")}
      >
        {icon}
      </span>

      <p className="text-label-sm text-on-surface-variant">{label}</p>

      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 size={20} className="animate-spin text-on-surface-variant" />
          <span className="text-label-sm text-on-surface-variant">Loading…</span>
        </div>
      ) : (
        <>
          <p className="text-headline-md font-semibold text-on-surface">{value}</p>
          {subValue && (
            <p className="text-label-sm text-on-surface-variant">{subValue}</p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Timeline item row ────────────────────────────────────────────────────────

function TimelineRow({ item }: { item: TimelineItem }) {
  const accentClass = TIMELINE_ACCENT[item.type] ?? "border-l-outline bg-surface-container";
  const badgeClass = TIMELINE_BADGE[item.type] ?? "bg-surface-container text-on-surface-variant";

  return (
    <div
      className={[
        "flex items-center justify-between gap-3 rounded-r-md border-l-4 px-4 py-3",
        accentClass,
      ].join(" ")}
    >
      <div className="min-w-0">
        <p className="truncate text-body-md font-medium text-on-surface">
          {item.title}
        </p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <span
          className={[
            "rounded-full px-2 py-0.5 text-label-sm font-medium capitalize",
            badgeClass,
          ].join(" ")}
        >
          {item.type}
        </span>
        <span className="flex items-center gap-1 text-label-sm text-on-surface-variant">
          <Calendar size={13} />
          {formatDueDate(item.due_at)}
        </span>
      </div>
    </div>
  );
}

// ─── Notification row (recent activity) ──────────────────────────────────────

function ActivityRow({ item }: { item: Notification }) {
  const ENTITY_ICON: Record<string, React.ReactNode> = {
    reminder: <Bell size={15} />,
    document: <FileText size={15} />,
    subscription: <CreditCard size={15} />,
    goal: <Target size={15} />,
  };

  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
        {ENTITY_ICON[item.entity_type] ?? <Bell size={15} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-label-md text-on-surface capitalize">
          {item.entity_type} notification
        </p>
        <p className="text-label-sm text-on-surface-variant capitalize">
          {item.status}
        </p>
      </div>
      <span className="flex-shrink-0 text-label-sm text-on-surface-variant">
        {formatNotificationDate(item.scheduled_at)}
      </span>
    </div>
  );
}

// ─── Quick action button ──────────────────────────────────────────────────────

function QuickAction({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-1 items-center justify-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-3 text-label-md font-medium text-on-surface transition-colors hover:bg-surface-container"
    >
      {icon}
      {label}
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();

  // ── Data fetches ─────────────────────────────────────────────────────────

  const { data: remindersData, isLoading: remindersLoading } = useQuery({
    queryKey: ["reminders", "active", "count"],
    queryFn: () => listReminders({ status: "active", per_page: 1 }),
    staleTime: 2 * 60_000,
  });

  const { data: documentsData, isLoading: documentsLoading } = useQuery({
    queryKey: ["documents", "count"],
    queryFn: () => listDocuments({ per_page: 1 }),
    staleTime: 2 * 60_000,
  });

  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ["subscriptions", "active", "count"],
    queryFn: () => listSubscriptions({ status: "active", per_page: 100 }),
    staleTime: 2 * 60_000,
  });

  const { data: timelineItems, isLoading: timelineLoading } = useQuery({
    queryKey: ["timeline", "30d"],
    queryFn: () => getTimeline({ range: "30d" }),
    staleTime: 5 * 60_000,
  });

  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => listNotifications({ per_page: 5 }),
    staleTime: 5 * 60_000,
  });

  // ── Derived values ───────────────────────────────────────────────────────

  const activeRemindersCount = remindersData?.meta?.total ?? 0;
  const documentsCount = documentsData?.documents?.length ?? 0;
  const activeSubscriptions = subscriptionsData?.subscriptions ?? [];
  const monthlyTotal = activeSubscriptions.reduce((sum, s) => sum + s.amount, 0);
  const currencyLabel = activeSubscriptions[0]?.currency ?? "IDR";
  const recentActivity = notificationsData?.notifications ?? [];

  const upcomingItems = (timelineItems ?? []).slice(0, 10);

  // ── Monthly cost formatter ───────────────────────────────────────────────

  const formatCurrency = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toLocaleString()}`;
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Page header ── */}
      <div>
        <h1 className="font-display text-headline-md text-on-surface">
          Dashboard
        </h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          {getGreeting()}, {user?.name?.split(" ")[0] ?? "there"}. Here&apos;s your life admin summary.
        </p>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Active Reminders"
          value={activeRemindersCount}
          icon={<Bell size={18} className="text-primary" />}
          iconBg="bg-primary/10"
          isLoading={remindersLoading}
        />
        <StatCard
          label="Documents"
          value={documentsCount}
          icon={<FileText size={18} className="text-secondary" />}
          iconBg="bg-secondary/10"
          isLoading={documentsLoading}
        />
        <StatCard
          label="Subscriptions"
          value={activeSubscriptions.length}
          subValue={
            activeSubscriptions.length > 0
              ? `${formatCurrency(monthlyTotal, currencyLabel)} / mo`
              : "No active subscriptions"
          }
          icon={<CreditCard size={18} className="text-amber-600" />}
          iconBg="bg-amber-100"
          isLoading={subscriptionsLoading}
        />
      </div>

      {/* ── Upcoming items ── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-title-lg text-on-surface">
            This Month
          </h2>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-label-md font-medium text-primary hover:underline"
          >
            View All
            <ArrowRight size={15} />
          </Link>
        </div>

        {timelineLoading ? (
          <div className="flex items-center justify-center py-8 text-on-surface-variant">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : upcomingItems.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-outline-variant bg-surface-container-lowest py-12 text-center">
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container">
              <Calendar size={28} className="text-on-surface-variant" />
            </span>
            <p className="mb-1 font-medium text-on-surface">You&apos;re all clear!</p>
            <p className="mb-4 text-body-md text-on-surface-variant">
              Nothing due this month.
            </p>
            <Link
              href="/reminders"
              className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-label-md font-medium text-on-primary hover:opacity-90"
            >
              <Plus size={16} />
              Add Reminder
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingItems.map((item) => (
              <TimelineRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* ── Quick actions ── */}
      <section>
        <h2 className="mb-4 font-display text-title-lg text-on-surface">
          Quick Actions
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <QuickAction
            href="/reminders?new=1"
            icon={<Bell size={18} />}
            label="New Reminder"
          />
          <QuickAction
            href="/documents?new=1"
            icon={<FileText size={18} />}
            label="Add Document"
          />
          <QuickAction
            href="/finances/goals?new=1"
            icon={<Target size={18} />}
            label="Set Goal"
          />
        </div>
      </section>

      {/* ── Recent activity ── */}
      <section>
        <h2 className="mb-4 font-display text-title-lg text-on-surface">
          Recent Activity
        </h2>

        {notificationsLoading ? (
          <div className="divide-y divide-outline-variant rounded-lg border border-outline-variant bg-surface-container-lowest px-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-3 py-3">
                <div className="h-8 w-8 shrink-0 rounded-full bg-surface-container" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-2/3 rounded bg-surface-container" />
                  <div className="h-3 w-1/3 rounded bg-surface-container" />
                </div>
                <div className="h-5 w-16 rounded-full bg-surface-container" />
              </div>
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <p className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-6 text-center text-body-md text-on-surface-variant">
            No recent activity to show.
          </p>
        ) : (
          <div className="divide-y divide-outline-variant rounded-lg border border-outline-variant bg-surface-container-lowest px-4">
            {recentActivity.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
