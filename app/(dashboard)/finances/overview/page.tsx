"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  BadgeDollarSign,
  Download,
  HardDrive,
  Home,
  Plus,
  ShoppingCart,
  X,
  Zap,
} from "lucide-react";

import {
  getFinancialSummary,
  getSpendingByCategory,
  getSpendingTrend,
  getUpcomingBills,
} from "@/lib/api/finances";
import { createSubscription, listSubscriptions } from "@/lib/api/subscriptions";
import type { BillingCycle, SpendingByCategory, Subscription, SubscriptionCategory, UpcomingBill } from "@/lib/api/types";
import { SpendingTrendChart } from "@/components/finances/overview/spending-trend-chart";

// ─── Add Transaction Modal ────────────────────────────────────────────────────

const txSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  amount: z.string().min(1, "Amount is required"),
  billing_cycle: z.enum(["weekly", "monthly", "quarterly", "yearly", "custom"] as [BillingCycle, ...BillingCycle[]]),
  category: z.enum(["entertainment", "productivity", "health", "education", "finance", "utilities", "other"] as [SubscriptionCategory, ...SubscriptionCategory[]]),
  next_billing_date: z.string().optional(),
  notes: z.string().optional(),
});
type TxFormData = z.infer<typeof txSchema>;

function parseAmount(val: string): number {
  return Number(val.replace(/\D/g, "")) || 0;
}
function formatAmount(val: string): string {
  const n = val.replace(/\D/g, "");
  return n ? Number(n).toLocaleString("id-ID") : "";
}

function AddTransactionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<TxFormData>({
    resolver: zodResolver(txSchema),
    defaultValues: { name: "", amount: "", billing_cycle: "monthly", category: "other", next_billing_date: "", notes: "" },
  });
  const amountRaw = watch("amount");

  const mutation = useMutation({
    mutationFn: (data: TxFormData) =>
      createSubscription({
        name: data.name,
        amount: parseAmount(data.amount),
        currency: "IDR",
        billing_cycle: data.billing_cycle,
        category: data.category,
        ...(data.next_billing_date ? { next_billing_date: new Date(data.next_billing_date).toISOString() } : {}),
        ...(data.notes ? { notes: data.notes } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["finances"] });
      reset();
      onClose();
    },
  });

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label="Add Transaction" className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        <div className="relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-2xl bg-surface-container-lowest shadow-xl sm:rounded-2xl">
          <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
            <h2 className="font-display text-title-lg text-on-surface">Add Transaction</h2>
            <button onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex-1 overflow-y-auto px-5 py-5" noValidate>
            {mutation.isError && (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <p className="mb-4 rounded-lg bg-error-container px-4 py-2.5 text-label-md text-error">
                {(mutation.error as any)?.response?.data?.message ?? (mutation.error as Error)?.message ?? "Something went wrong."}
              </p>
            )}

            {/* Name */}
            <div className="mb-4">
              <label className="mb-1.5 block text-label-md text-on-surface-variant">Name <span className="text-error">*</span></label>
              <input {...register("name")} placeholder="e.g. Netflix, Listrik PLN" className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary" />
              {errors.name && <p className="mt-1 text-label-sm text-error">{errors.name.message}</p>}
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="mb-1.5 block text-label-md text-on-surface-variant">Amount (IDR) <span className="text-error">*</span></label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-label-md text-on-surface-variant">Rp</span>
                <input value={amountRaw} onChange={(e) => setValue("amount", formatAmount(e.target.value))} placeholder="65.000" inputMode="numeric" className="w-full rounded-lg border border-outline-variant bg-surface py-2.5 pl-9 pr-3.5 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <input type="hidden" {...register("amount")} />
              {errors.amount && <p className="mt-1 text-label-sm text-error">{errors.amount.message}</p>}
            </div>

            {/* Billing Cycle + Category */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-label-md text-on-surface-variant">Billing Cycle</label>
                <select {...register("billing_cycle")} className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                  {(["weekly", "monthly", "quarterly", "yearly", "custom"] as BillingCycle[]).map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-label-md text-on-surface-variant">Category</label>
                <select {...register("category")} className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                  {(["entertainment", "productivity", "health", "education", "finance", "utilities", "other"] as SubscriptionCategory[]).map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Next Billing Date */}
            <div className="mb-4">
              <label className="mb-1.5 block text-label-md text-on-surface-variant">Next Billing Date</label>
              <input {...register("next_billing_date")} type="date" className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="mb-1.5 block text-label-md text-on-surface-variant">Notes</label>
              <textarea {...register("notes")} rows={2} placeholder="Optional notes…" className="w-full resize-none rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>

            <button type="submit" disabled={mutation.isPending} className="w-full rounded-lg bg-primary py-3 font-display text-label-lg text-on-primary shadow transition hover:brightness-110 disabled:opacity-60">
              {mutation.isPending ? "Saving…" : "Save Transaction"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRp(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

// ─── Total Expenses Hero Card ─────────────────────────────────────────────────

function TotalExpensesCard() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["finances", "summary"],
    queryFn: getFinancialSummary,
    staleTime: 60_000,
  });

  if (isLoading)
    return (
      <div className="animate-pulse rounded-xl p-5 shadow-md" style={{ backgroundColor: "#064e3b" }}>
        <div className="mb-3 h-3 w-1/2 rounded bg-white/20" />
        <div className="mb-4 h-10 w-3/4 rounded bg-white/20" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-14 rounded-lg bg-white/10" />
          <div className="h-14 rounded-lg bg-white/10" />
        </div>
      </div>
    );

  const total = summary?.total_monthly_cost ?? 0;

  return (
    <div
      className="rounded-xl p-5 text-white shadow-md"
      style={{ backgroundColor: "#064e3b" }}
    >
      <p className="mb-1 text-label-sm uppercase tracking-wide opacity-70">
        Total Expenses · This Month
      </p>
      <p className="mb-3 font-display text-display-sm">{formatRp(total)}</p>

      {/* Change indicator — static since backend doesn't track history yet */}
      <div className="mb-4 flex items-center gap-1.5 text-label-md opacity-80">
        <ArrowDown size={14} className="text-emerald-300" />
        <span style={{ color: "#6ee7b7" }}>Calculating vs last month…</span>
      </div>

      {/* Sub-stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white/10 px-3 py-2.5">
          <p className="text-label-sm opacity-70">Subscriptions</p>
          <p className="font-display text-label-lg">
            {summary ? String(summary.subscription_count) + " active" : "—"}
          </p>
        </div>
        <div className="rounded-lg bg-white/10 px-3 py-2.5">
          <p className="text-label-sm opacity-70">Upcoming Bills</p>
          <p className="font-display text-label-lg">
            {summary ? String(summary.upcoming_bills) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Linked Accounts (MVP empty state) ───────────────────────────────────────

function LinkedAccountsCard() {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
      <h3 className="mb-4 font-display text-title-lg text-on-surface">
        Linked Accounts
      </h3>
      <div className="flex flex-col items-center py-6 text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container">
          <HardDrive size={22} className="text-on-surface-variant" />
        </span>
        <p className="mb-1 text-label-md text-on-surface-variant">
          No accounts linked yet.
        </p>
        <button
          disabled
          className="mt-3 flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-outline-variant px-4 py-2 text-label-md text-on-surface-variant opacity-50"
        >
          <Plus size={14} />
          Connect Bank (Coming Soon)
        </button>
      </div>
    </div>
  );
}

// ─── Category Breakdown ───────────────────────────────────────────────────────

const CATEGORY_META: Record<
  string,
  { icon: React.ElementType; color: string }
> = {
  household: { icon: Home, color: "text-emerald-600" },
  utilities: { icon: Zap, color: "text-amber-600" },
  transport: { icon: ShoppingCart, color: "text-blue-600" },
  others: { icon: BadgeDollarSign, color: "text-purple-600" },
  entertainment: { icon: ShoppingCart, color: "text-pink-600" },
  productivity: { icon: Zap, color: "text-blue-500" },
  health: { icon: BadgeDollarSign, color: "text-red-500" },
  education: { icon: BadgeDollarSign, color: "text-indigo-500" },
  finance: { icon: BadgeDollarSign, color: "text-green-600" },
};

function CategoryTile({ item }: { item: SpendingByCategory }) {
  const meta = CATEGORY_META[item.category] ?? {
    icon: BadgeDollarSign,
    color: "text-on-surface-variant",
  };
  const Icon = meta.icon;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container",
          meta.color,
        ].join(" ")}
      >
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-label-md font-medium capitalize text-on-surface">
          {item.category}
        </p>
        <p className="text-label-sm text-on-surface-variant">
          {formatRp(item.amount)}
        </p>
      </div>
      <span className="ml-auto shrink-0 font-display text-label-lg text-on-surface">
        {item.percentage}%
      </span>
    </div>
  );
}

type Period = "monthly" | "last_month";

function CategoryBreakdownCard() {
  const [period, setPeriod] = useState<Period>("monthly");

  const { data, isLoading } = useQuery({
    queryKey: ["finances", "spending", period],
    queryFn: () => getSpendingByCategory(period),
    staleTime: 60_000,
  });

  const categories = data ?? [];

  // Fallback: derive from subscriptions when API not yet implemented
  const { data: subsData } = useQuery({
    queryKey: ["subscriptions", "active"],
    queryFn: () => listSubscriptions({ status: "active", per_page: 100 }),
    staleTime: 60_000,
    enabled: categories.length === 0,
  });

  // Build category totals from subscriptions if no real spending data
  let derivedCategories: SpendingByCategory[] = [];
  if (categories.length === 0 && subsData?.subscriptions) {
    const totals: Record<string, number> = {};
    const totalAll = subsData.subscriptions.reduce((s, sub) => s + sub.amount, 0);
    for (const sub of subsData.subscriptions) {
      totals[sub.category] = (totals[sub.category] ?? 0) + sub.amount;
    }
    derivedCategories = Object.entries(totals).map(([cat, amount]) => ({
      category: cat,
      amount,
      percentage: totalAll > 0 ? Math.round((amount / totalAll) * 100) : 0,
      currency: "IDR",
    }));
  }

  const displayCategories = categories.length > 0 ? categories : derivedCategories;

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-title-md text-on-surface">
          Category Breakdown
        </h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="rounded-lg border border-outline-variant bg-surface px-3 py-1.5 text-label-md text-on-surface outline-none focus:border-primary"
        >
          <option value="monthly">Current Month</option>
          <option value="last_month">Last Month</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex animate-pulse items-center gap-3 rounded-lg border border-outline-variant p-3">
              <div className="h-9 w-9 shrink-0 rounded-full bg-surface-container" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-1/2 rounded bg-surface-container" />
                <div className="h-3 w-1/3 rounded bg-surface-container" />
              </div>
            </div>
          ))}
        </div>
      ) : displayCategories.length === 0 ? (
        <p className="py-8 text-center text-label-md text-on-surface-variant">
          No spending data available.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {displayCategories.slice(0, 8).map((c) => (
            <CategoryTile key={c.category} item={c} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Spending Trend Card ──────────────────────────────────────────────────────

function SpendingTrendCard() {
  const { data, isLoading } = useQuery({
    queryKey: ["finances", "trend"],
    queryFn: () => getSpendingTrend("weekly"),
    staleTime: 60_000,
  });

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
      <h3 className="mb-4 font-display text-title-md text-on-surface">
        Spending Trend
      </h3>
      {isLoading ? (
        <div className="animate-pulse rounded-lg bg-surface-container" style={{ height: 200 }} />
      ) : (
        <SpendingTrendChart data={data ?? []} />
      )}
    </div>
  );
}

// ─── Upcoming Bills Table ─────────────────────────────────────────────────────

function billDueLabel(
  dueDate: string,
): { label: string; className: string } {
  const diffMs = new Date(dueDate).getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0)
    return { label: "Overdue", className: "text-error bg-error-container" };
  if (diffDays <= 7)
    return { label: `Due in ${diffDays}d`, className: "text-amber-700 bg-amber-100" };
  return {
    label: new Date(dueDate).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    className: "text-on-surface-variant bg-surface-container",
  };
}

function buildBillsFromSubscriptions(subs: Subscription[]): UpcomingBill[] {
  return subs
    .filter((s) => s.next_billing_date)
    .sort(
      (a, b) =>
        new Date(a.next_billing_date!).getTime() -
        new Date(b.next_billing_date!).getTime(),
    )
    .map((s) => ({
      id: s.id,
      name: s.name,
      amount: s.amount,
      currency: s.currency,
      due_date: s.next_billing_date!,
      category: s.category,
      status: s.status,
    }));
}

function UpcomingBillsTable() {
  const [page, setPage] = useState(1);

  const { data: billsData, isLoading: billsLoading } = useQuery({
    queryKey: ["finances", "upcoming-bills", page],
    queryFn: () => getUpcomingBills({ page, per_page: 10 }),
    staleTime: 60_000,
  });

  const { data: subsData } = useQuery({
    queryKey: ["subscriptions", "active"],
    queryFn: () => listSubscriptions({ status: "active", per_page: 100 }),
    staleTime: 60_000,
    enabled: !billsData?.bills || billsData.bills.length === 0,
  });

  const bills: UpcomingBill[] =
    (billsData?.bills && billsData.bills.length > 0)
      ? billsData.bills
      : subsData?.subscriptions
        ? buildBillsFromSubscriptions(subsData.subscriptions)
        : [];

  const hasMore = billsData?.meta
    ? page < billsData.meta.total_pages
    : false;

  const soonCount = bills.filter((b) => {
    const diff = Math.ceil((new Date(b.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  }).length;

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
        <h3 className="font-display text-title-md text-on-surface">
          Upcoming Bills
        </h3>
        {soonCount > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-0.5 text-label-sm text-amber-700">
            {soonCount} payment{soonCount !== 1 ? "s" : ""} due this week
          </span>
        )}
      </div>

      {billsLoading ? (
        <div className="divide-y divide-outline-variant">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex animate-pulse items-center gap-3 px-5 py-3">
              <div className="h-4 w-32 rounded bg-surface-container" />
              <div className="h-4 w-20 rounded bg-surface-container" />
              <div className="ml-auto h-4 w-24 rounded bg-surface-container" />
              <div className="h-6 w-16 rounded-full bg-surface-container" />
            </div>
          ))}
        </div>
      ) : bills.length === 0 ? (
        <p className="py-8 text-center text-label-md text-on-surface-variant">
          No upcoming bills.
        </p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant text-label-sm text-on-surface-variant">
                  <th className="px-5 py-3">NAME</th>
                  <th className="px-5 py-3">CATEGORY</th>
                  <th className="px-5 py-3">AMOUNT</th>
                  <th className="px-5 py-3">DUE DATE</th>
                  <th className="px-5 py-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {bills.map((b) => {
                  const due = billDueLabel(b.due_date);
                  return (
                    <tr key={b.id} className="hover:bg-surface-container">
                      <td className="px-5 py-3 font-medium text-on-surface">
                        {b.name}
                      </td>
                      <td className="px-5 py-3 capitalize text-on-surface-variant">
                        {b.category}
                      </td>
                      <td className="px-5 py-3 font-display text-on-surface">
                        {formatRp(b.amount)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={[
                            "rounded-full px-2 py-0.5 text-label-sm",
                            due.className,
                          ].join(" ")}
                        >
                          {due.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 capitalize text-on-surface-variant">
                        {b.status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <ul className="divide-y divide-outline-variant md:hidden">
            {bills.map((b) => {
              const due = billDueLabel(b.due_date);
              return (
                <li key={b.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-on-surface">{b.name}</p>
                    <p className="text-label-sm capitalize text-on-surface-variant">
                      {b.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-label-lg text-on-surface">
                      {formatRp(b.amount)}
                    </p>
                    <span
                      className={[
                        "mt-0.5 inline-block rounded-full px-2 py-0.5 text-label-sm",
                        due.className,
                      ].join(" ")}
                    >
                      {due.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          {hasMore && (
            <div className="border-t border-outline-variant px-5 py-3">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="text-label-md text-primary hover:underline"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Budget Status widget (right sidebar, desktop only) ───────────────────────

function BudgetStatusWidget() {
  const { data: summary } = useQuery({
    queryKey: ["finances", "summary"],
    queryFn: getFinancialSummary,
    staleTime: 60_000,
  });

  // We don't have a "monthly budget" concept yet — show total_monthly_cost
  const total = summary?.total_monthly_cost ?? 0;

  return (
    <div className="sticky top-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
      <h3 className="mb-3 font-display text-title-sm text-on-surface">
        Monthly Spending
      </h3>
      <p className="mb-3 font-display text-title-md text-primary">
        {formatRp(total)}
      </p>
      <div className="mb-1.5 flex items-center justify-between text-label-sm text-on-surface-variant">
        <span>From subscriptions</span>
        <span>{summary?.subscription_count ?? 0} active</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-container">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: total > 0 ? "60%" : "0%" }}
        />
      </div>
      <p className="mt-2 text-label-sm text-on-surface-variant">
        Track more transactions to see a full budget report.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FinancesOverviewPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "csv">("pdf");

  async function handleExport() {
    setExporting(true);
    try {
      const { exportFinances } = await import("@/lib/api/finances");
      const blob = await exportFinances(exportFormat);
      const extMap: Record<string, string> = { pdf: "pdf", excel: "xlsx", csv: "csv" };
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `finances-${new Date().toISOString().slice(0, 10)}.${extMap[exportFormat]}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal export data. Coba lagi.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-display-sm text-on-surface">
            Financial Overview
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Manage your spending and monthly commitments effortlessly.
          </p>
        </div>
        <div className="flex gap-2">
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
            className="flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-label-md text-on-surface shadow-sm hover:bg-surface-container disabled:opacity-60">
            <Download size={15} />
            {exporting ? "Exporting…" : "Export"}
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-label-md text-on-primary shadow hover:brightness-110">
            <Plus size={15} />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
        {/* Main */}
        <div className="space-y-6">
          {/* Hero + Linked Accounts row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[55fr_45fr]">
            <TotalExpensesCard />
            <LinkedAccountsCard />
          </div>

          {/* Category Breakdown + Spending Trend row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[55fr_45fr]">
            <CategoryBreakdownCard />
            <SpendingTrendCard />
          </div>

          {/* Upcoming Bills */}
          <UpcomingBillsTable />
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <BudgetStatusWidget />
        </aside>
      </div>

      {/* Sidebar on mobile — below grid */}
      <div className="mt-6 lg:hidden">
        <BudgetStatusWidget />
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
