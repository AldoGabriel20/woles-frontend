"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createGoal,
  updateGoal,
  updateGoalProgress,
} from "@/lib/api/goals";
import type { Goal } from "@/lib/api/types";

// ─── Icon options ──────────────────────────────────────────────────────────────

const GOAL_ICONS = [
  { value: "love", label: "❤️ Love / Family" },
  { value: "emergency", label: "🚨 Emergency Fund" },
  { value: "vehicle", label: "🚗 Vehicle" },
  { value: "home", label: "🏠 Home" },
  { value: "travel", label: "✈️ Travel" },
  { value: "other", label: "⭐ Other" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(val: string): string {
  const num = val.replace(/\D/g, "");
  return num ? Number(num).toLocaleString("id-ID") : "";
}

function parseRupiah(val: string): number {
  return Number(val.replace(/\D/g, "")) || 0;
}

// ─── Create / Edit schema ─────────────────────────────────────────────────────

const createSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  icon: z.string().optional(),
  target_amount_raw: z.string().min(1, "Target amount is required"),
  monthly_target_raw: z.string().optional(),
  currency: z.string().min(1),
  target_date: z.string().optional(),
});

type CreateFormData = z.infer<typeof createSchema>;

// ─── Progress schema ──────────────────────────────────────────────────────────

const progressSchema = z.object({
  amount_raw: z.string().min(1, "Amount is required"),
});

type ProgressFormData = z.infer<typeof progressSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

type DrawerMode = "create" | "edit" | "progress";

interface GoalDrawerProps {
  open: boolean;
  onClose: () => void;
  mode?: DrawerMode;
  goal?: Goal | null;
}

// ─── Create / Edit form ───────────────────────────────────────────────────────

function CreateEditForm({
  goal,
  onClose,
}: {
  goal?: Goal | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!goal;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      title: goal?.title ?? "",
      icon: goal?.icon ?? "other",
      target_amount_raw: goal?.target_amount
        ? Number(goal.target_amount).toLocaleString("id-ID")
        : "",
      monthly_target_raw: goal?.monthly_target
        ? Number(goal.monthly_target).toLocaleString("id-ID")
        : "",
      currency: goal?.currency ?? "IDR",
      target_date: goal?.target_date?.slice(0, 10) ?? "",
    },
  });

  useEffect(() => {
    if (goal) {
      reset({
        title: goal.title,
        icon: goal.icon ?? "other",
        target_amount_raw: Number(goal.target_amount).toLocaleString("id-ID"),
        monthly_target_raw: goal.monthly_target
          ? Number(goal.monthly_target).toLocaleString("id-ID")
          : "",
        currency: goal.currency,
        target_date: goal.target_date?.slice(0, 10) ?? "",
      });
    } else {
      reset({ title: "", icon: "other", target_amount_raw: "", monthly_target_raw: "", currency: "IDR", target_date: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal]);

  const mutation = useMutation({
    mutationFn: (data: CreateFormData) => {
      const payload = {
        title: data.title,
        icon: data.icon ?? "other",
        target_amount: parseRupiah(data.target_amount_raw),
        monthly_target: data.monthly_target_raw ? parseRupiah(data.monthly_target_raw) : undefined,
        currency: data.currency,
        target_date: data.target_date ? `${data.target_date}T00:00:00Z` : undefined,
      };
      return isEdit ? updateGoal(goal!.id, payload) : createGoal(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      onClose();
    },
  });

  const targetRaw = watch("target_amount_raw");
  const monthlyRaw = watch("monthly_target_raw");

  return (
    <form
      onSubmit={handleSubmit((d) => mutation.mutate(d))}
      className="flex-1 overflow-y-auto px-5 py-5"
      noValidate
    >
      {mutation.isError && (
        <p className="mb-4 rounded-lg bg-error-container px-4 py-2.5 text-label-md text-error">
          {(mutation.error as Error)?.message ?? "Something went wrong. Try again."}
        </p>
      )}

      {/* Title */}
      <div className="mb-4">
        <label className="mb-1.5 block text-label-md text-on-surface-variant">
          Goal Title <span className="text-error">*</span>
        </label>
        <input
          {...register("title")}
          placeholder="e.g. Emergency Fund, Buy a Car"
          className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {errors.title && (
          <p className="mt-1 text-label-sm text-error">{errors.title.message}</p>
        )}
      </div>

      {/* Icon */}
      <div className="mb-4">
        <label className="mb-1.5 block text-label-md text-on-surface-variant">
          Icon
        </label>
        <select
          {...register("icon")}
          className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          {GOAL_ICONS.map((ic) => (
            <option key={ic.value} value={ic.value}>
              {ic.label}
            </option>
          ))}
        </select>
      </div>

      {/* Target Amount */}
      <div className="mb-4">
        <label className="mb-1.5 block text-label-md text-on-surface-variant">
          Target Amount (IDR) <span className="text-error">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-label-md text-on-surface-variant">
            Rp
          </span>
          <input
            value={targetRaw}
            onChange={(e) =>
              setValue("target_amount_raw", formatRupiah(e.target.value))
            }
            placeholder="50.000.000"
            inputMode="numeric"
            className="w-full rounded-lg border border-outline-variant bg-surface py-2.5 pl-9 pr-3.5 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        {/* hidden registration for validation */}
        <input type="hidden" {...register("target_amount_raw")} />
        {errors.target_amount_raw && (
          <p className="mt-1 text-label-sm text-error">
            {errors.target_amount_raw.message}
          </p>
        )}
      </div>

      {/* Monthly Target */}
      <div className="mb-4">
        <label className="mb-1.5 block text-label-md text-on-surface-variant">
          Monthly Target (optional)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-label-md text-on-surface-variant">
            Rp
          </span>
          <input
            value={monthlyRaw}
            onChange={(e) =>
              setValue("monthly_target_raw", formatRupiah(e.target.value))
            }
            placeholder="2.000.000"
            inputMode="numeric"
            className="w-full rounded-lg border border-outline-variant bg-surface py-2.5 pl-9 pr-3.5 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Target Date */}
      <div className="mb-6">
        <label className="mb-1.5 block text-label-md text-on-surface-variant">
          Target Date (optional)
        </label>
        <input
          {...register("target_date")}
          type="date"
          className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded-lg bg-primary py-3 font-display text-label-lg text-on-primary shadow transition hover:brightness-110 disabled:opacity-60"
      >
        {mutation.isPending
          ? isEdit ? "Saving…" : "Creating…"
          : isEdit ? "Save Changes" : "Create Goal"}
      </button>
    </form>
  );
}

// ─── Progress form ────────────────────────────────────────────────────────────

function ProgressForm({ goal, onClose }: { goal: Goal; onClose: () => void }) {
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      amount_raw: Number(goal.current_amount).toLocaleString("id-ID"),
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ProgressFormData) =>
      updateGoalProgress(goal.id, parseRupiah(data.amount_raw)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      onClose();
    },
  });

  const amountRaw = watch("amount_raw");

  return (
    <form
      onSubmit={handleSubmit((d) => mutation.mutate(d))}
      className="flex-1 overflow-y-auto px-5 py-5"
      noValidate
    >
      <p className="mb-4 text-body-md text-on-surface-variant">
        Update total savings for <span className="font-medium text-on-surface">{goal.title}</span>.
      </p>

      {mutation.isError && (
        <p className="mb-4 rounded-lg bg-error-container px-4 py-2.5 text-label-md text-error">
          {(mutation.error as Error)?.message ?? "Something went wrong."}
        </p>
      )}

      <div className="mb-6">
        <label className="mb-1.5 block text-label-md text-on-surface-variant">
          New Total Savings (IDR) <span className="text-error">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-label-md text-on-surface-variant">
            Rp
          </span>
          <input
            value={amountRaw}
            onChange={(e) => setValue("amount_raw", formatRupiah(e.target.value))}
            placeholder="10.000.000"
            inputMode="numeric"
            className="w-full rounded-lg border border-outline-variant bg-surface py-2.5 pl-9 pr-3.5 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        {/* hidden for zod validation */}
        <input
          type="hidden"
          value={amountRaw}
          onChange={() => {}}
          name="amount_raw"
        />
        {errors.amount_raw && (
          <p className="mt-1 text-label-sm text-error">{errors.amount_raw.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded-lg bg-primary py-3 font-display text-label-lg text-on-primary shadow transition hover:brightness-110 disabled:opacity-60"
      >
        {mutation.isPending ? "Updating…" : "Update Progress"}
      </button>
    </form>
  );
}

// ─── Drawer shell ─────────────────────────────────────────────────────────────

export function GoalDrawer({ open, onClose, mode = "create", goal }: GoalDrawerProps) {
  if (!open) return null;

  const title =
    mode === "progress"
      ? "Update Progress"
      : mode === "edit"
        ? "Edit Goal"
        : "New Goal";

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          "fixed z-50 flex flex-col bg-surface-container-lowest shadow-xl",
          "bottom-0 left-0 right-0 max-h-[90dvh] rounded-t-2xl",
          "md:bottom-auto md:right-0 md:top-0 md:h-full md:w-[420px] md:rounded-none md:rounded-l-2xl",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
          <h2 className="font-display text-title-lg text-on-surface">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
          >
            <X size={18} />
          </button>
        </div>

        {mode === "progress" && goal ? (
          <ProgressForm goal={goal} onClose={onClose} />
        ) : (
          <CreateEditForm goal={mode === "edit" ? goal : null} onClose={onClose} />
        )}
      </aside>
    </>
  );
}
