"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createReminder, updateReminder } from "@/lib/api/reminders";
import type { Reminder, ReminderCategory, RecurrenceType } from "@/lib/api/types";

// ─── Schema ───────────────────────────────────────────────────────────────────

const CATEGORIES: ReminderCategory[] = [
  "bill",
  "health",
  "vehicle",
  "insurance",
  "subscription",
  "tax",
  "personal",
  "work",
  "family",
  "custom",
];

const RECURRENCE_TYPES: RecurrenceType[] = [
  "once",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "custom_interval",
];

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  category: z.enum(["bill","health","vehicle","insurance","subscription","tax","personal","work","family","custom"] as [ReminderCategory, ...ReminderCategory[]]),
  recurrence_type: z.enum(["once","daily","weekly","monthly","yearly","custom_interval"] as [RecurrenceType, ...RecurrenceType[]]),
  interval_days: z.number().int().min(1).optional(),
  next_run_at_date: z.string().min(1, "Date is required"),
  next_run_at_time: z.string().min(1, "Time is required"),
  timezone: z.string().min(1, "Timezone is required"),
});

type FormData = z.infer<typeof schema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toLocalDatetimeString(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { date, time };
}

function toISO(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString();
}

const INDONESIAN_TIMEZONES = [
  "Asia/Jakarta",
  "Asia/Makassar",
  "Asia/Jayapura",
  "Asia/Singapore",
  "UTC",
];

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ");
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

interface ReminderDrawerProps {
  open: boolean;
  onClose: () => void;
  reminder?: Reminder | null;
}

export function ReminderDrawer({ open, onClose, reminder }: ReminderDrawerProps) {
  const queryClient = useQueryClient();
  const isEdit = !!reminder;

  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const defaultDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const defaultTime = `${pad(today.getHours())}:00`;

  const { date: editDate, time: editTime } = reminder?.next_run_at
    ? toLocalDatetimeString(reminder.next_run_at)
    : { date: defaultDate, time: defaultTime };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: reminder?.title ?? "",
      category: reminder?.category ?? "personal",
      recurrence_type: reminder?.recurrence_type ?? "monthly",
      interval_days:
        (reminder?.recurrence_rule as { interval_days?: number } | null | undefined)
          ?.interval_days ?? 7,
      next_run_at_date: editDate,
      next_run_at_time: editTime,
      timezone: reminder?.timezone ?? "Asia/Jakarta",
    },
  });

  // Reset form when reminder prop changes (opening for new vs edit)
  useEffect(() => {
    if (reminder) {
      const { date, time } = toLocalDatetimeString(reminder.next_run_at);
      reset({
        title: reminder.title,
        category: reminder.category,
        recurrence_type: reminder.recurrence_type,
        interval_days:
          (reminder.recurrence_rule as { interval_days?: number } | null | undefined)
            ?.interval_days ?? 7,
        next_run_at_date: date,
        next_run_at_time: time,
        timezone: reminder.timezone,
      });
    } else {
      reset({
        title: "",
        category: "personal",
        recurrence_type: "monthly",
        interval_days: 7,
        next_run_at_date: defaultDate,
        next_run_at_time: defaultTime,
        timezone: "Asia/Jakarta",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminder, open]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const next_run_at = toISO(data.next_run_at_date, data.next_run_at_time);
      const recurrence_rule =
        data.recurrence_type === "custom_interval"
          ? { interval_days: data.interval_days }
          : undefined;
      const payload = {
        title: data.title,
        category: data.category,
        recurrence_type: data.recurrence_type,
        next_run_at,
        timezone: data.timezone,
        ...(recurrence_rule ? { recurrence_rule } : {}),
      };
      return isEdit
        ? updateReminder(reminder!.id, payload)
        : createReminder(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      onClose();
    },
  });

  const recurrenceType = watch("recurrence_type");

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel: right-side on md+, bottom sheet on mobile */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Edit reminder" : "New reminder"}
        className={[
          "fixed z-50 flex flex-col bg-surface-container-lowest shadow-xl",
          // Mobile: bottom sheet
          "bottom-0 left-0 right-0 max-h-[90dvh] rounded-t-2xl",
          // Desktop: right drawer
          "md:bottom-auto md:right-0 md:top-0 md:h-full md:w-[420px] md:rounded-none md:rounded-l-2xl",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
          <h2 className="font-display text-title-lg text-on-surface">
            {isEdit ? "Edit Reminder" : "New Reminder"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
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
              Title <span className="text-error">*</span>
            </label>
            <input
              {...register("title")}
              placeholder="e.g. Pay electricity bill"
              className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {errors.title && (
              <p className="mt-1 text-label-sm text-error">{errors.title.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="mb-1.5 block text-label-md text-on-surface-variant">
              Category
            </label>
            <select
              {...register("category")}
              className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {capitalize(c)}
                </option>
              ))}
            </select>
          </div>

          {/* Recurrence Type */}
          <div className="mb-4">
            <label className="mb-1.5 block text-label-md text-on-surface-variant">
              Recurrence
            </label>
            <select
              {...register("recurrence_type")}
              className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {RECURRENCE_TYPES.map((r) => (
                <option key={r} value={r}>
                  {capitalize(r)}
                </option>
              ))}
            </select>
          </div>

          {/* Interval days (only for custom_interval) */}
          {recurrenceType === "custom_interval" && (
            <div className="mb-4">
              <label className="mb-1.5 block text-label-md text-on-surface-variant">
                Repeat every (days)
              </label>
              <input
                {...register("interval_days", { valueAsNumber: true })}
                type="number"
                min={1}
                placeholder="7"
                className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {errors.interval_days && (
                <p className="mt-1 text-label-sm text-error">
                  {errors.interval_days.message}
                </p>
              )}
            </div>
          )}

          {/* Date + Time */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-label-md text-on-surface-variant">
                Date <span className="text-error">*</span>
              </label>
              <input
                {...register("next_run_at_date")}
                type="date"
                className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {errors.next_run_at_date && (
                <p className="mt-1 text-label-sm text-error">
                  {errors.next_run_at_date.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-label-md text-on-surface-variant">
                Time <span className="text-error">*</span>
              </label>
              <input
                {...register("next_run_at_time")}
                type="time"
                className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {errors.next_run_at_time && (
                <p className="mt-1 text-label-sm text-error">
                  {errors.next_run_at_time.message}
                </p>
              )}
            </div>
          </div>

          {/* Timezone */}
          <div className="mb-6">
            <label className="mb-1.5 block text-label-md text-on-surface-variant">
              Timezone
            </label>
            <select
              {...register("timezone")}
              className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {INDONESIAN_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-lg bg-primary py-3 font-display text-label-lg text-on-primary shadow transition hover:brightness-110 disabled:opacity-60"
          >
            {mutation.isPending
              ? isEdit
                ? "Saving…"
                : "Creating…"
              : isEdit
                ? "Save Changes"
                : "Create Reminder"}
          </button>
        </form>
      </aside>
    </>
  );
}
