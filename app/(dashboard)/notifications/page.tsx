"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Eye } from "lucide-react";

import {
  exportNotifications,
  getNotificationStats,
  listNotifications,
} from "@/lib/api/notifications";
import type {
  Notification,
  NotificationEntityType,
  NotificationStatus,
} from "@/lib/api/types";

// ─── Constants ────────────────────────────────────────────────────────────────

type RangeKey = "7d" | "30d" | "90d";

const CATEGORY_FILTERS: { key: NotificationEntityType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "reminder", label: "Bills" },
  { key: "document", label: "Documents" },
  { key: "subscription", label: "Subscriptions" },
  { key: "goal", label: "Goals" },
];

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "90d", label: "Last 90 Days" },
];

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: NotificationStatus }) {
  const map: Record<NotificationStatus, { label: string; className: string }> = {
    sent: { label: "Sent", className: "bg-emerald-100 text-emerald-700" },
    scheduled: { label: "Scheduled", className: "bg-surface-container text-on-surface-variant" },
    pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
    failed: { label: "Failed", className: "bg-error-container text-error" },
    cancelled: { label: "Cancelled", className: "bg-surface-container text-on-surface-variant" },
  };
  const { label, className } = map[status] ?? map.pending;
  return (
    <span className={["rounded-full px-2 py-0.5 text-label-sm font-medium", className].join(" ")}>
      {label}
    </span>
  );
}

// ─── Category badge ───────────────────────────────────────────────────────────

function CategoryBadge({ type }: { type: NotificationEntityType }) {
  const map: Record<NotificationEntityType, { label: string; className: string }> = {
    reminder: { label: "Bills", className: "bg-blue-100 text-blue-700" },
    document: { label: "Documents", className: "bg-teal-100 text-teal-700" },
    subscription: { label: "Subscriptions", className: "bg-purple-100 text-purple-700" },
    goal: { label: "Goals", className: "bg-emerald-100 text-emerald-700" },
  };
  const { label, className } = map[type] ?? { label: type, className: "bg-surface-container text-on-surface-variant" };
  return (
    <span className={["rounded-full px-2 py-0.5 text-label-sm font-medium capitalize", className].join(" ")}>
      {label}
    </span>
  );
}

// ─── Date formatter ───────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }) + ", " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// ─── Row content (expandable) ─────────────────────────────────────────────────

function contentSummary(n: Notification): string {
  const type = n.entity_type;
  const ch = n.channel ?? "WhatsApp";
  const time = n.sent_at ? formatDateTime(n.sent_at) : n.scheduled_at ? formatDateTime(n.scheduled_at) : "";
  if (n.failure_reason)
    return `Delivery failed: ${n.failure_reason}`;
  return `${capitalize(type)} notification via ${capitalize(ch)}${time ? " · " + time : ""}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Desktop Table Row ────────────────────────────────────────────────────────

function TableRow({ n }: { n: Notification }) {
  const [expanded, setExpanded] = useState(false);
  const content = contentSummary(n);
  const truncated = content.length > 60 ? content.slice(0, 60) + "…" : content;

  return (
    <tr className="border-b border-outline-variant hover:bg-surface-container">
      <td className="px-4 py-3">
        <StatusBadge status={n.status} />
      </td>
      <td className="px-4 py-3 text-label-md text-on-surface-variant">
        {n.sent_at
          ? formatDateTime(n.sent_at)
          : n.scheduled_at
            ? formatDateTime(n.scheduled_at)
            : "—"}
      </td>
      <td className="px-4 py-3">
        <CategoryBadge type={n.entity_type} />
      </td>
      <td className="max-w-[240px] px-4 py-3 text-label-md text-on-surface">
        <button
          onClick={() => setExpanded((p) => !p)}
          className="text-left hover:text-primary"
          title="Click to expand"
        >
          {expanded ? content : truncated}
        </button>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => setExpanded((p) => !p)}
          aria-label="View message"
          className="flex h-7 w-7 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
        >
          <Eye size={15} />
        </button>
      </td>
    </tr>
  );
}

// ─── Mobile Card ──────────────────────────────────────────────────────────────

function MobileCard({ n }: { n: Notification }) {
  const [expanded, setExpanded] = useState(false);
  const content = contentSummary(n);
  const truncated = content.length > 80 ? content.slice(0, 80) + "…" : content;

  return (
    <div className="border-b border-outline-variant px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-label-md text-on-surface">{expanded ? content : truncated}</p>
        <StatusBadge status={n.status} />
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <CategoryBadge type={n.entity_type} />
        <span className="text-label-sm text-on-surface-variant">
          {n.sent_at
            ? formatDateTime(n.sent_at)
            : n.scheduled_at
              ? formatDateTime(n.scheduled_at)
              : "—"}
        </span>
      </div>
      {content.length > 80 && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="mt-1 text-label-sm text-primary"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-outline-variant">
          <td className="px-4 py-3"><div className="h-5 w-16 rounded-full bg-surface-container" /></td>
          <td className="px-4 py-3"><div className="h-4 w-32 rounded bg-surface-container" /></td>
          <td className="px-4 py-3"><div className="h-5 w-20 rounded-full bg-surface-container" /></td>
          <td className="px-4 py-3"><div className="h-4 w-48 rounded bg-surface-container" /></td>
          <td className="px-4 py-3"><div className="h-6 w-6 rounded-full bg-surface-container" /></td>
        </tr>
      ))}
    </>
  );
}

// ─── Stats row ────────────────────────────────────────────────────────────────

function StatsRow() {
  const { data: stats } = useQuery({
    queryKey: ["notifications", "stats"],
    queryFn: getNotificationStats,
    staleTime: 60_000,
  });

  if (!stats) return null;

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-display text-label-lg font-bold">
          {stats.delivery_rate_pct}%
        </span>
        <div>
          <p className="text-label-sm text-on-surface-variant">Delivery Rate</p>
          <p className="font-display text-title-md text-on-surface">
            {stats.delivery_rate_pct}% delivered
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <span className="font-display text-label-lg font-bold text-primary">
            {stats.total_sent}
          </span>
        </span>
        <div>
          <p className="text-label-sm text-on-surface-variant">
            Top Category: {stats.top_category ? capitalize(stats.top_category) : "—"}
          </p>
          <p className="font-display text-title-md text-on-surface">
            {stats.total_sent} sent · {stats.total_failed} failed
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [categoryFilter, setCategoryFilter] = useState<NotificationEntityType | "all">("all");
  const [range, setRange] = useState<RangeKey>("30d");
  const [page, setPage] = useState(1);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [exporting, setExporting] = useState(false);

  const queryKey = ["notifications", categoryFilter, range, page];

  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: () =>
      listNotifications({
        ...(categoryFilter !== "all" ? { entity_type: categoryFilter } : {}),
        page,
        per_page: 20,
      }),
  });

  const notifications = data?.notifications ?? [];
  const meta = data?.meta;
  const hasMore = meta ? page < meta.total_pages : false;

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await exportNotifications({ format: exportFormat, range });
      const extMap: Record<string, string> = { pdf: "pdf", excel: "xlsx", csv: "csv" };
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `notifications-${range}.${extMap[exportFormat]}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal export data. Coba lagi.");
    } finally {
      setExporting(false);
    }
  }

  function handleTabChange(key: NotificationEntityType | "all") {
    setCategoryFilter(key);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-display-sm text-on-surface">
          Notification History
        </h1>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as "pdf" | "excel" | "csv")}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-label-md text-on-surface shadow-sm focus:outline-none"
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
          </select>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-label-md text-on-surface shadow-sm hover:bg-surface-container disabled:opacity-60 sm:flex-none"
          >
            <Download size={15} />
            {exporting ? "Exporting…" : "Export"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* Category chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => handleTabChange(f.key as NotificationEntityType | "all")}
              className={[
                "shrink-0 rounded-full px-4 py-1.5 text-label-md font-medium transition",
                categoryFilter === f.key
                  ? "bg-primary text-on-primary shadow"
                  : "border border-outline-variant text-on-surface-variant hover:bg-surface-container",
              ].join(" ")}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Date range */}
        <select
          value={range}
          onChange={(e) => {
            setRange(e.target.value as RangeKey);
            setPage(1);
          }}
          className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-label-md text-on-surface outline-none focus:border-primary"
        >
          {RANGE_OPTIONS.map((r) => (
            <option key={r.key} value={r.key}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant">
              {["STATUS", "DATE & TIME", "CATEGORY", "MESSAGE CONTENT", "ACTIONS"].map((h) => (
                <th key={h} className="px-4 py-3 text-label-sm text-on-surface-variant">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : notifications.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-label-md text-on-surface-variant">
                  No notifications found for the selected filters.
                </td>
              </tr>
            ) : (
              notifications.map((n) => <TableRow key={n.id} n={n} />)
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest md:hidden">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 w-3/4 rounded bg-surface-container" />
                <div className="h-3 w-1/2 rounded bg-surface-container" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <p className="py-12 text-center text-label-md text-on-surface-variant">
            No notifications found.
          </p>
        ) : (
          notifications.map((n) => <MobileCard key={n.id} n={n} />)
        )}
      </div>

      {/* Pagination */}
      {(hasMore || page > 1) && (
        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-outline-variant bg-surface px-4 py-2 text-label-md text-on-surface hover:bg-surface-container disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-label-md text-on-surface-variant">
            Page {page}{meta ? ` of ${meta.total_pages}` : ""}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore || isFetching}
            className="rounded-lg border border-outline-variant bg-surface px-4 py-2 text-label-md text-on-surface hover:bg-surface-container disabled:opacity-40"
          >
            {isFetching ? "Loading…" : "Next"}
          </button>
        </div>
      )}

      {/* Stats row */}
      <StatsRow />
    </div>
  );
}
