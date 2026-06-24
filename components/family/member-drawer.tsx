"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createFamilyMember, updateFamilyMember } from "@/lib/api/family";
import type { FamilyMember, FamilyRole } from "@/lib/api/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES: FamilyRole[] = ["spouse", "child", "parent", "sibling", "other"];

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  role: z.enum(["spouse", "child", "parent", "sibling", "other"] as [FamilyRole, ...FamilyRole[]]),
  relation_label: z.string().max(50).optional(),
});

type FormData = z.infer<typeof schema>;

// ─── Drawer ───────────────────────────────────────────────────────────────────

interface MemberDrawerProps {
  open: boolean;
  onClose: () => void;
  member?: FamilyMember | null;
}

export function MemberDrawer({ open, onClose, member }: MemberDrawerProps) {
  const queryClient = useQueryClient();
  const isEdit = !!member;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: member?.name ?? "",
      role: member?.role ?? "other",
      relation_label: member?.relation_label ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: member?.name ?? "",
      role: member?.role ?? "other",
      relation_label: member?.relation_label ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member, open]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        name: data.name,
        role: data.role,
        ...(data.relation_label ? { relation_label: data.relation_label } : {}),
      };
      return isEdit
        ? updateFamilyMember(member!.id, payload)
        : createFamilyMember(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family", "members"] });
      onClose();
    },
  });

  if (!open) return null;

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
        aria-label={isEdit ? "Edit family member" : "Add family member"}
        className={[
          "fixed z-50 flex flex-col bg-surface-container-lowest shadow-xl",
          "bottom-0 left-0 right-0 max-h-[90dvh] rounded-t-2xl",
          "md:bottom-auto md:right-0 md:top-0 md:h-full md:w-[400px] md:rounded-none md:rounded-l-2xl",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
          <h2 className="font-display text-title-lg text-on-surface">
            {isEdit ? "Edit Member" : "Add Family Member"}
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

          {/* Name */}
          <div className="mb-4">
            <label className="mb-1.5 block text-label-md text-on-surface-variant">
              Full Name <span className="text-error">*</span>
            </label>
            <input
              {...register("name")}
              placeholder="e.g. Budi Santoso"
              className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {errors.name && (
              <p className="mt-1 text-label-sm text-error">{errors.name.message}</p>
            )}
          </div>

          {/* Role */}
          <div className="mb-4">
            <label className="mb-1.5 block text-label-md text-on-surface-variant">
              Role <span className="text-error">*</span>
            </label>
            <select
              {...register("role")}
              className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary capitalize"
            >
              {ROLES.map((r) => (
                <option key={r} value={r} className="capitalize">
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Relation label */}
          <div className="mb-6">
            <label className="mb-1.5 block text-label-md text-on-surface-variant">
              Relation Label{" "}
              <span className="text-on-surface-variant/50">(optional, e.g. "Wife", "Dad")</span>
            </label>
            <input
              {...register("relation_label")}
              placeholder="e.g. Wife"
              className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-lg bg-primary py-3 font-display text-label-lg text-on-primary shadow transition hover:brightness-110 disabled:opacity-60"
          >
            {mutation.isPending
              ? isEdit ? "Saving…" : "Adding…"
              : isEdit ? "Save Changes" : "Add Member"}
          </button>
        </form>
      </aside>
    </>
  );
}
