"use client";

import { useRef, useState } from "react";
import {
  Car,
  FileText,
  HardDrive,
  MoreVertical,
  Pencil,
  Plus,
  Shield,
  Trash2,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteDocument, getDocumentFileURL } from "@/lib/api/documents";
import type { Document, VaultCategory } from "@/lib/api/types";

// ─── Category → icon ──────────────────────────────────────────────────────────

const CATEGORY_ICON: Record<VaultCategory, React.ReactNode> = {
  identity: <Shield size={20} className="text-primary" />,
  vehicles: <Car size={20} className="text-primary" />,
  property: <HardDrive size={20} className="text-primary" />,
  financial: <FileText size={20} className="text-primary" />,
  health: <FileText size={20} className="text-primary" />,
  education: <FileText size={20} className="text-primary" />,
  insurance: <Shield size={20} className="text-primary" />,
  legal: <FileText size={20} className="text-primary" />,
  other: <FileText size={20} className="text-primary" />,
};

// ─── Expiry badge ─────────────────────────────────────────────────────────────

function ExpiryBadge({ expiryDate }: { expiryDate: string | null }) {
  if (!expiryDate) return null;

  const diffMs = new Date(expiryDate).getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let label: string;
  let className: string;

  if (diffDays < 0) {
    label = "Expired";
    className = "bg-error-container text-error";
  } else if (diffDays <= 30) {
    label = `Expires in ${diffDays}d`;
    className = "bg-amber-100 text-amber-700";
  } else {
    label = new Date(expiryDate).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    className = "bg-surface-container text-on-surface-variant";
  }

  return (
    <span
      className={["rounded-full px-2 py-0.5 text-label-sm font-medium", className].join(" ")}
    >
      {label}
    </span>
  );
}

// ─── Category label ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: VaultCategory }) {
  return (
    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-label-sm text-primary capitalize">
      {category}
    </span>
  );
}

// ─── 3-dot Menu ───────────────────────────────────────────────────────────────

interface DocumentCardProps {
  doc: Document;
  onEdit: (doc: Document) => void;
}

export function DocumentCard({ doc, onEdit }: DocumentCardProps) {
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["documents"] });
    queryClient.invalidateQueries({ queryKey: ["documents", "storage"] });
    queryClient.invalidateQueries({ queryKey: ["documents", "vault-health"] });
  };

  const deleteMutation = useMutation({
    mutationFn: () => deleteDocument(doc.id),
    onSuccess: invalidate,
  });

  const icon = CATEGORY_ICON[doc.vault_category] ?? (
    <FileText size={20} className="text-primary" />
  );

  return (
    <div
      className="relative flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-4 transition-shadow hover:shadow-md"
      onMouseLeave={() => setMenuOpen(false)}
    >
      {/* Top row: icon + 3-dot */}
      <div className="mb-3 flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          {icon}
        </span>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Actions"
            className="flex h-7 w-7 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 min-w-[140px] rounded-lg border border-outline-variant bg-surface-container-lowest py-1 shadow-lg">
              {doc.file_url && (
                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    setLoadingFile(true);
                    try {
                      const url = await getDocumentFileURL(doc.id);
                      window.open(url, "_blank", "noopener,noreferrer");
                    } catch {
                      alert("Gagal membuka file. Coba lagi.");
                    } finally {
                      setLoadingFile(false);
                    }
                  }}
                  disabled={loadingFile}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-label-md text-on-surface hover:bg-surface-container disabled:opacity-50"
                >
                  <FileText size={16} />
                  {loadingFile ? "Loading…" : "View File"}
                </button>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(doc);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-label-md text-on-surface hover:bg-surface-container"
              >
                <Pencil size={16} />
                Edit
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  if (confirm(`Delete "${doc.title}"?`)) deleteMutation.mutate();
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-label-md text-error hover:bg-surface-container"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <p className="mb-2 line-clamp-2 font-display text-title-md text-on-surface">
        {doc.title}
      </p>

      {/* Badges */}
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
        <CategoryBadge category={doc.vault_category} />
        <ExpiryBadge expiryDate={doc.expiry_date} />
      </div>

      {/* No file indicator */}
      {!doc.file_url && (
        <p className="mt-2 text-label-sm text-on-surface-variant/60">
          No file attached
        </p>
      )}
    </div>
  );
}

// ─── Add New Card ─────────────────────────────────────────────────────────────

export function AddDocumentCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-outline-variant bg-transparent p-4 transition hover:border-primary hover:bg-primary/5 min-h-[140px]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container">
        <Plus size={20} className="text-primary" />
      </span>
      <p className="text-label-md text-on-surface-variant">Add Document</p>
    </button>
  );
}
