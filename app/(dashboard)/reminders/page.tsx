"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Plus, Search } from "lucide-react";

import { listReminders } from "@/lib/api/reminders";
import type { Reminder, ReminderStatus } from "@/lib/api/types";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { ReminderCard } from "@/components/reminders/reminder-card";
import { ReminderDrawer } from "@/components/reminders/reminder-drawer";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = "all" | ReminderStatus;

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "paused", label: "Paused" },
  { key: "cancelled", label: "Cancelled" },
];

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Bell size={32} className="text-primary" />
      </span>
      <p className="mb-1 font-display text-title-lg text-on-surface">
        No reminders yet
      </p>
      <p className="mb-6 max-w-xs text-body-md text-on-surface-variant">
        Create your first reminder or let Woles detect them via WhatsApp.
      </p>
      <button
        onClick={onNew}
        className="rounded-lg bg-primary px-5 py-2.5 text-label-md text-on-primary shadow hover:brightness-110"
      >
        + New Reminder
      </button>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="h-9 w-9 rounded-full bg-surface-container" />
        <div className="h-5 w-20 rounded-full bg-surface-container" />
      </div>
      <div className="mb-2 h-4 w-3/4 rounded bg-surface-container" />
      <div className="mb-3 h-3 w-1/2 rounded bg-surface-container" />
      <div className="h-3 w-2/5 rounded bg-surface-container" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RemindersPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editReminder, setEditReminder] = useState<Reminder | null>(null);

  const search = useDebounce(searchInput, 300);

  // Reset to page 1 when filter/search changes
  const queryKey = ["reminders", activeTab, search, page];

  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: () =>
      listReminders({
        ...(activeTab !== "all" ? { status: activeTab as ReminderStatus } : {}),
        ...(search ? { search } : {}),
        sort: "next_run_at",
        order: "asc",
        page,
        per_page: 20,
      }),
  });

  const reminders = data?.reminders ?? [];
  const meta = data?.meta;
  const hasMore = meta ? page < meta.total_pages : false;

  function openNew() {
    setEditReminder(null);
    setDrawerOpen(true);
  }

  function openEdit(r: Reminder) {
    setEditReminder(r);
    setDrawerOpen(true);
  }

  function handleTabChange(key: TabKey) {
    setActiveTab(key);
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);
    setPage(1);
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* ── Header ─── */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-display-sm text-on-surface">
            Reminders
          </h1>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-label-md text-on-primary shadow hover:brightness-110"
          >
            <Plus size={16} />
            New Reminder
          </button>
        </div>

        {/* ── Search ─── */}
        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search reminders…"
            className="w-full rounded-lg border border-outline-variant bg-surface py-2.5 pl-9 pr-4 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* ── Filter tabs ─── */}
        <div className="mb-6 flex gap-1 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={[
                "shrink-0 rounded-full px-4 py-1.5 text-label-md font-medium transition",
                activeTab === tab.key
                  ? "bg-primary text-on-primary shadow"
                  : "text-on-surface-variant hover:bg-surface-container",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content ─── */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : reminders.length === 0 ? (
          <EmptyState onNew={openNew} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reminders.map((r) => (
                <ReminderCard key={r.id} reminder={r} onEdit={openEdit} />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isFetching}
                  className="rounded-lg border border-outline-variant bg-surface px-6 py-2.5 text-label-md text-on-surface shadow-sm hover:bg-surface-container disabled:opacity-50"
                >
                  {isFetching ? "Loading…" : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Create / Edit Drawer ─── */}
      <ReminderDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        reminder={editReminder}
      />
    </>
  );
}
