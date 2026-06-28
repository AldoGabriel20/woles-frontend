"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createDocument, updateDocument, uploadFile } from "@/lib/api/documents";
import type { Document, VaultCategory } from "@/lib/api/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const VAULT_CATEGORIES: VaultCategory[] = [
  "identity",
  "vehicles",
  "property",
  "financial",
  "health",
  "education",
  "insurance",
  "legal",
  "other",
];

const DOCUMENT_TYPES: { value: string; label: string }[] = [
  { value: "ktp", label: "KTP" },
  { value: "passport", label: "Passport" },
  { value: "sim", label: "SIM" },
  { value: "visa", label: "Visa" },
  { value: "stnk", label: "STNK" },
  { value: "bpkb", label: "BPKB" },
  { value: "vehicle_insurance", label: "Asuransi Kendaraan" },
  { value: "health_insurance", label: "Asuransi Kesehatan" },
  { value: "life_insurance", label: "Asuransi Jiwa" },
  { value: "tax", label: "Pajak" },
  { value: "investment", label: "Investasi" },
  { value: "other", label: "Lainnya" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  document_type: z.string().optional(),
  vault_category: z.enum([
    "identity", "vehicles", "property", "financial", "health",
    "education", "insurance", "legal", "other",
  ] as [VaultCategory, ...VaultCategory[]]),
  expiry_date: z.string().optional(),
  notes: z.string().max(2000, "Notes must be ≤ 2000 characters").optional(),
});

type FormData = z.infer<typeof schema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  /** Provide a document to open in edit mode */
  document?: Document | null;
}

export function UploadModal({ open, onClose, document: doc }: UploadModalProps) {
  const queryClient = useQueryClient();
  const isEdit = !!doc;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: doc?.title ?? "",
      document_type: doc?.document_type ?? "other",
      vault_category: doc?.vault_category ?? "other",
      expiry_date: doc?.expiry_date?.slice(0, 10) ?? "",
      notes: doc?.notes ?? "",
    },
  });

  // Sync form when switching documents or toggling open
  useEffect(() => {
    reset({
      title: doc?.title ?? "",
      document_type: doc?.document_type ?? "other",
      vault_category: doc?.vault_category ?? "other",
      expiry_date: doc?.expiry_date?.slice(0, 10) ?? "",
      notes: doc?.notes ?? "",
    });
    setFile(null);
    setFileError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, open]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["documents"] });
    queryClient.invalidateQueries({ queryKey: ["documents", "storage"] });
    queryClient.invalidateQueries({ queryKey: ["documents", "vault-health"] });
  };

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      let savedDoc: Document;
      const payload = {
        title: data.title,
        vault_category: data.vault_category,
        ...(data.document_type ? { document_type: data.document_type } : {}),
        ...(data.expiry_date ? { expiry_date: data.expiry_date } : {}),
        ...(data.notes ? { notes: data.notes } : {}),
      };

      if (isEdit) {
        savedDoc = await updateDocument(doc!.id, payload);
      } else {
        savedDoc = await createDocument(payload);
      }

      if (file) {
        await uploadFile(savedDoc.id, file);
      }
    },
    onSuccess: () => {
      invalidateAll();
      onClose();
    },
  });

  // ── File handling ──────────────────────────────────────────────────────────

  function validateAndSetFile(f: File) {
    if (!ALLOWED_TYPES.includes(f.type)) {
      setFileError("Only PDF, JPG, or PNG files are allowed.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setFileError("File must be ≤ 10 MB.");
      return;
    }
    setFileError(null);
    setFile(f);
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Edit document" : "Upload document"}
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      >
        <div className="relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-2xl bg-surface-container-lowest shadow-xl sm:rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
            <h2 className="font-display text-title-lg text-on-surface">
              {isEdit ? "Edit Document" : "Upload Document"}
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
                placeholder="e.g. Passport, STNK, KTP"
                className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {errors.title && (
                <p className="mt-1 text-label-sm text-error">{errors.title.message}</p>
              )}
            </div>

            {/* Document type + Category */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-label-md text-on-surface-variant">
                  Type
                </label>
                <select
                  {...register("document_type")}
                  className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  {DOCUMENT_TYPES.map((dt) => (
                    <option key={dt.value} value={dt.value}>
                      {dt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-label-md text-on-surface-variant">
                  Category <span className="text-error">*</span>
                </label>
                <select
                  {...register("vault_category")}
                  className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  {VAULT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {capitalize(c)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expiry Date */}
            <div className="mb-4">
              <label className="mb-1.5 block text-label-md text-on-surface-variant">
                Expiry Date
              </label>
              <input
                {...register("expiry_date")}
                type="date"
                className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="mb-1.5 block text-label-md text-on-surface-variant">
                Notes
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                maxLength={2000}
                placeholder="Optional notes…"
                className="w-full resize-none rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {errors.notes && (
                <p className="mt-1 text-label-sm text-error">{errors.notes.message}</p>
              )}
            </div>

            {/* File upload */}
            <div className="mb-6">
              <label className="mb-1.5 block text-label-md text-on-surface-variant">
                File <span className="text-on-surface-variant/50">(PDF / JPG / PNG, max 10 MB)</span>
              </label>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={[
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-6 transition",
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-outline-variant hover:border-primary hover:bg-primary/5",
                ].join(" ")}
              >
                <UploadCloud size={24} className="text-on-surface-variant" />
                {file ? (
                  <p className="text-label-md text-on-surface">{file.name}</p>
                ) : (
                  <p className="text-label-md text-on-surface-variant">
                    Drag & drop or{" "}
                    <span className="text-primary underline">browse</span>
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) validateAndSetFile(f);
                  }}
                />
              </div>
              {fileError && (
                <p className="mt-1 text-label-sm text-error">{fileError}</p>
              )}
              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="mt-1 text-label-sm text-on-surface-variant hover:text-error"
                >
                  Remove file
                </button>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={mutation.isPending || !!fileError}
              className="w-full rounded-lg bg-primary py-3 font-display text-label-lg text-on-primary shadow transition hover:brightness-110 disabled:opacity-60"
            >
              {mutation.isPending
                ? isEdit
                  ? "Saving…"
                  : "Uploading…"
                : isEdit
                  ? "Save Changes"
                  : "Upload Document"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
