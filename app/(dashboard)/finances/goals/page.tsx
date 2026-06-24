"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Car,
  CheckCircle2,
  Lock,
  Pencil,
  Plus,
  Rocket,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { deleteGoal, listGoalHistory, listGoals } from "@/lib/api/goals";
import type { Goal } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/useAuth";
import { GoalDrawer } from "@/components/finances/goals/goal-drawer";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRp(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function pct(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

function getGoalIcon(icon: string | null): string {
  switch (icon) {
    case "love": return "❤️";
    case "emergency": return "🚨";
    case "vehicle": return "🚗";
    case "home": return "🏠";
    case "travel": return "✈️";
    default: return "⭐";
  }
}

function progressBarColor(p: number): string {
  if (p >= 70) return "bg-primary";
  if (p >= 30) return "bg-blue-500";
  return "bg-amber-500";
}

// ─── Active Goal Hero Card ────────────────────────────────────────────────────

function ActiveGoalCard({
  goal,
  onUpdateProgress,
}: {
  goal: Goal | null | undefined;
  onUpdateProgress: () => void;
}) {
  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest py-12 text-center">
        <span className="mb-3 text-4xl">⭐</span>
        <p className="mb-1 font-display text-title-lg text-on-surface">
          No active goal
        </p>
        <p className="mb-4 text-body-md text-on-surface-variant">
          Set a financial goal to start tracking your progress.
        </p>
      </div>
    );
  }

  const progress = pct(goal.current_amount, goal.target_amount);
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);

  return (
    <div className="rounded-xl bg-primary p-5 text-on-primary shadow-md">
      {/* ACTIVE GOAL chip */}
      <span className="mb-3 inline-block rounded-full bg-white/20 px-3 py-0.5 text-label-sm font-medium uppercase tracking-wide">
        Active Goal
      </span>

      <p className="mb-0.5 font-display text-display-sm">
        {getGoalIcon(goal.icon)} {goal.title}
      </p>
      <p className="mb-5 text-title-md opacity-80">
        Target: {formatRp(goal.target_amount)}
      </p>

      {/* Progress bar */}
      <div className="mb-1 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-white transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mb-4 text-right text-label-sm opacity-80">
        {progress}% Completed
      </p>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Current Savings", value: formatRp(goal.current_amount) },
          { label: "Remaining", value: formatRp(remaining) },
          {
            label: "Monthly Target",
            value: goal.monthly_target ? formatRp(goal.monthly_target) : "—",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg bg-white/10 px-3 py-2.5 text-center"
          >
            <p className="text-label-sm opacity-70">{s.label}</p>
            <p className="font-display text-label-lg">{s.value}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onUpdateProgress}
        className="mt-4 w-full rounded-lg bg-white/20 py-2.5 text-label-md font-medium transition hover:bg-white/30"
      >
        <Pencil size={14} className="mr-1.5 inline" />
        Update Progress
      </button>
    </div>
  );
}

// ─── Pro Card ─────────────────────────────────────────────────────────────────

function ProCard({ plan }: { plan: string }) {
  if (plan === "advanced") return null;
  return (
    <div
      className="rounded-xl p-5 shadow-sm"
      style={{ backgroundColor: "#064e3b" }}
    >
      <Rocket size={28} className="mb-3 text-white" />
      <p className="mb-2 font-display text-title-lg text-white">
        Advanced Goal Analytics
      </p>
      <p className="mb-4 text-body-md" style={{ color: "#80bea6" }}>
        Predict exactly when you&apos;ll reach your goal based on spending patterns.
      </p>
      <Link
        href="/billing/checkout"
        className="inline-block rounded-full bg-white px-5 py-2 text-label-md font-medium"
        style={{ color: "#064e3b" }}
      >
        Unlock Insights
      </Link>
    </div>
  );
}

// ─── Trajectory Widget (locked) ───────────────────────────────────────────────

function TrajectoryWidget({ plan }: { plan: string }) {
  const locked = plan !== "advanced";

  return (
    <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-title-md text-on-surface">
          Trajectory Outlook
        </p>
        <span className="rounded-full bg-primary px-2 py-0.5 text-label-sm font-medium text-on-primary">
          PRO
        </span>
      </div>

      {locked ? (
        <div className="flex flex-col items-center py-6 text-center">
          {/* Blurred fake chart */}
          <div
            className="mb-4 h-24 w-full rounded-lg"
            style={{
              background: "linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 50%, #34d399 100%)",
              filter: "blur(6px)",
            }}
          />
          <Lock size={22} className="mb-2 text-on-surface-variant" />
          <p className="mb-1 font-display text-title-sm text-on-surface">
            Predictive Growth
          </p>
          <p className="mb-4 text-label-md text-on-surface-variant">
            Unlock future projections based on inflation and savings rates.
          </p>
          <Link
            href="/billing/checkout"
            className="w-full rounded-lg bg-primary py-2.5 text-label-md font-medium text-on-primary text-center block hover:brightness-110"
          >
            Upgrade to Pro
          </Link>
        </div>
      ) : (
        <div className="flex items-center justify-center py-6 text-on-surface-variant">
          <TrendingUp size={20} className="mr-2" />
          <span className="text-label-md">Projections available</span>
        </div>
      )}
    </div>
  );
}

// ─── Goals List ───────────────────────────────────────────────────────────────

function GoalRow({
  goal,
  onEdit,
}: {
  goal: Goal;
  onEdit: (g: Goal) => void;
}) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const progress = pct(goal.current_amount, goal.target_amount);

  const deleteMutation = useMutation({
    mutationFn: () => deleteGoal(goal.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  return (
    <li>
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-container"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg">
          {getGoalIcon(goal.icon)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-label-lg text-on-surface">
            {goal.title}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container">
              <div
                className={["h-full rounded-full transition-all", progressBarColor(progress)].join(" ")}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="shrink-0 text-label-sm text-on-surface-variant">
              {progress}%
            </span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-outline-variant bg-surface-container px-4 py-3">
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Target", value: formatRp(goal.target_amount) },
              { label: "Saved", value: formatRp(goal.current_amount) },
              { label: "Remaining", value: formatRp(Math.max(0, goal.target_amount - goal.current_amount)) },
              { label: "Monthly", value: goal.monthly_target ? formatRp(goal.monthly_target) : "—" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-surface-container-lowest p-2.5">
                <p className="text-label-sm text-on-surface-variant">{s.label}</p>
                <p className="font-display text-label-lg text-on-surface">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(goal)}
              className="flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-1.5 text-label-sm text-on-surface hover:bg-surface-container-lowest"
            >
              <Pencil size={13} /> Edit
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete "${goal.title}"?`)) deleteMutation.mutate();
              }}
              className="flex items-center gap-1.5 rounded-lg border border-error/30 px-3 py-1.5 text-label-sm text-error hover:bg-error-container"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function GoalsList({
  onEdit,
}: {
  onEdit: (g: Goal) => void;
}) {
  const { data } = useQuery({
    queryKey: ["goals", "all"],
    queryFn: () => listGoals(),
  });

  const goals = data?.goals ?? [];

  if (goals.length === 0)
    return (
      <p className="py-6 text-center text-label-md text-on-surface-variant">
        No goals yet.
      </p>
    );

  return (
    <ul className="divide-y divide-outline-variant">
      {goals.map((g) => (
        <GoalRow key={g.id} goal={g} onEdit={onEdit} />
      ))}
    </ul>
  );
}

// ─── Finance Tip card ─────────────────────────────────────────────────────────

function FinanceTip({ activeGoal }: { activeGoal: Goal | null | undefined }) {
  const tip = activeGoal
    ? activeGoal.monthly_target
      ? `You need ${formatRp(activeGoal.monthly_target)} per month to reach "${activeGoal.title}" on time. Stay consistent!`
      : `Set a monthly target for "${activeGoal.title}" to stay on track with your savings.`
    : "Create a financial goal to start building wealth systematically. Even small amounts add up!";

  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <span className="mt-0.5 shrink-0 text-xl">💡</span>
      <div>
        <p className="mb-0.5 font-display text-label-lg text-amber-800">
          Woles Finance Tip
        </p>
        <p className="text-label-md text-amber-700">{tip}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GoalsPage() {
  const { user } = useAuth();
  const plan = user?.plan ?? "free";

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "progress">("create");
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const { data: activeData } = useQuery({
    queryKey: ["goals", "active"],
    queryFn: () => listGoals({ status: "active", per_page: 1 }),
  });

  const activeGoal = activeData?.goals?.[0] ?? null;

  function openCreate() {
    setSelectedGoal(null);
    setDrawerMode("create");
    setDrawerOpen(true);
  }

  function openEdit(g: Goal) {
    setSelectedGoal(g);
    setDrawerMode("edit");
    setDrawerOpen(true);
  }

  function openProgress() {
    if (!activeGoal) return;
    setSelectedGoal(activeGoal);
    setDrawerMode("progress");
    setDrawerOpen(true);
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="mb-1 flex items-center justify-between">
          <div>
            <h1 className="font-display text-display-sm text-on-surface">
              Financial Goal Tracker
            </h1>
            <p className="text-body-md text-on-surface-variant">
              Tracking your calm journey to financial freedom.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={openProgress}
              disabled={!activeGoal}
              className="flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-label-md text-on-surface shadow-sm hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Pencil size={15} />
              Update Progress
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-label-md text-on-primary shadow hover:brightness-110"
            >
              <Plus size={15} />
              New Goal
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Active goal hero */}
            <ActiveGoalCard goal={activeGoal} onUpdateProgress={openProgress} />

            {/* All goals */}
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest">
              <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3.5">
                <h2 className="font-display text-title-md text-on-surface">
                  All Financial Goals
                </h2>
                <Link
                  href="/finances/goals/history"
                  className="text-label-md text-primary hover:underline"
                >
                  View History →
                </Link>
              </div>
              <GoalsList onEdit={openEdit} />
            </div>

            {/* Finance tip */}
            <FinanceTip activeGoal={activeGoal} />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <ProCard plan={plan} />
            <TrajectoryWidget plan={plan} />
          </div>
        </div>
      </div>

      <GoalDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode={drawerMode}
        goal={selectedGoal}
      />
    </>
  );
}
