"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock, Plus, Users } from "lucide-react";
import Link from "next/link";

import { getSharedReminders, listFamilyMembers } from "@/lib/api/family";
import type { FamilyMember, Reminder } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/useAuth";
import { MemberCard } from "@/components/family/member-card";
import { MemberDrawer } from "@/components/family/member-drawer";

// ─── Upgrade gate ─────────────────────────────────────────────────────────────

function UpgradeGate() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container">
        <Lock size={36} className="text-on-surface-variant" />
      </span>
      <h2 className="mb-2 font-display text-title-lg text-on-surface">
        Advanced Plan Required
      </h2>
      <p className="mb-6 max-w-xs text-body-md text-on-surface-variant">
        Family Management is available on the Advanced plan. Upgrade to manage your
        family members and share reminders.
      </p>
      <Link
        href="/billing/checkout"
        className="rounded-lg bg-primary px-6 py-3 font-display text-label-lg text-on-primary shadow hover:brightness-110"
      >
        Upgrade to Advanced
      </Link>
    </div>
  );
}

// ─── Shared Reminders table ───────────────────────────────────────────────────

function dueBadge(reminder: Reminder): { label: string; className: string } {
  const diffMs = new Date(reminder.next_run_at).getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0)
    return { label: "Urgent", className: "bg-error-container text-error" };
  if (diffDays <= 3)
    return { label: "Upcoming", className: "bg-amber-100 text-amber-700" };
  return { label: "Safe", className: "bg-emerald-100 text-emerald-700" };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SharedRemindersSection() {
  const { data } = useQuery({
    queryKey: ["family", "reminders"],
    queryFn: () => getSharedReminders({ per_page: 20 }),
    // 403 is expected for non-advanced plans — handled gracefully
    retry: false,
  });

  const reminders = data?.reminders ?? [];

  if (reminders.length === 0) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest">
        <div className="border-b border-outline-variant px-5 py-4">
          <h2 className="font-display text-title-md text-on-surface">
            Shared Reminders
          </h2>
        </div>
        <p className="py-10 text-center text-label-md text-on-surface-variant">
          No shared reminders yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="border-b border-outline-variant px-5 py-4">
        <h2 className="font-display text-title-md text-on-surface">
          Shared Reminders
        </h2>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant">
              {["TASK NAME", "DUE DATE", "STATUS"].map((h) => (
                <th key={h} className="px-5 py-3 text-label-sm text-on-surface-variant">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {reminders.map((r) => {
              const badge = dueBadge(r);
              return (
                <tr key={r.id} className="hover:bg-surface-container">
                  <td className="px-5 py-3 font-medium text-on-surface">
                    {r.title}
                  </td>
                  <td className="px-5 py-3 text-label-md text-on-surface-variant">
                    {formatDate(r.next_run_at)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-label-sm font-medium",
                        badge.className,
                      ].join(" ")}
                    >
                      {badge.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <ul className="divide-y divide-outline-variant md:hidden">
        {reminders.map((r) => {
          const badge = dueBadge(r);
          return (
            <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium text-on-surface">{r.title}</p>
                <p className="text-label-sm text-on-surface-variant">
                  {formatDate(r.next_run_at)}
                </p>
              </div>
              <span
                className={[
                  "shrink-0 rounded-full px-2 py-0.5 text-label-sm font-medium",
                  badge.className,
                ].join(" ")}
              >
                {badge.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
      <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-surface-container" />
      <div className="mx-auto mb-2 h-4 w-24 rounded bg-surface-container" />
      <div className="mx-auto h-5 w-16 rounded-full bg-surface-container" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FamilyPage() {
  const { user } = useAuth();
  const plan = user?.plan ?? "free";

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editMember, setEditMember] = useState<FamilyMember | null>(null);

  const { data: membersData, isLoading } = useQuery({
    queryKey: ["family", "members"],
    queryFn: listFamilyMembers,
    retry: false,
    enabled: plan === "advanced",
  });

  const members = membersData ?? [];

  if (plan !== "advanced") {
    return <UpgradeGate />;
  }

  function openAdd() {
    setEditMember(null);
    setDrawerOpen(true);
  }

  function openEdit(m: FamilyMember) {
    setEditMember(m);
    setDrawerOpen(true);
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-display-sm text-on-surface">
            Family Management
          </h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-label-md text-on-primary shadow hover:brightness-110"
          >
            <Plus size={15} />
            Add Family Member
          </button>
        </div>

        {/* Members grid */}
        {isLoading ? (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : members.length === 0 ? (
          <div className="mb-8 flex flex-col items-center py-16 text-center">
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Users size={30} className="text-primary" />
            </span>
            <p className="mb-1 font-display text-title-lg text-on-surface">
              No family members yet
            </p>
            <p className="mb-4 max-w-xs text-body-md text-on-surface-variant">
              Add your family members to share reminders and track household tasks together.
            </p>
            <button
              onClick={openAdd}
              className="rounded-lg bg-primary px-5 py-2.5 text-label-md text-on-primary shadow hover:brightness-110"
            >
              + Add First Member
            </button>
          </div>
        ) : (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {members.map((m) => (
              <MemberCard key={m.id} member={m} onEdit={openEdit} />
            ))}
          </div>
        )}

        {/* Shared Reminders */}
        <SharedRemindersSection />
      </div>

      {/* Drawer */}
      <MemberDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        member={editMember}
      />
    </>
  );
}
