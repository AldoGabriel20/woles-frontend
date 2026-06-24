"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  FileText,
  HardDrive,
  Lightbulb,
  Search,
  Shield,
} from "lucide-react";

import { getStorageUsage, getVaultHealth, listDocuments } from "@/lib/api/documents";
import type { Document, VaultCategory } from "@/lib/api/types";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { AddDocumentCard, DocumentCard } from "@/components/documents/document-card";
import { UploadModal } from "@/components/documents/upload-modal";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type TabKey = "all" | VaultCategory;

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All Files" },
  { key: "vehicles", label: "Vehicles" },
  { key: "identity", label: "Identity" },
  { key: "insurance", label: "Insurance" },
  { key: "financial", label: "Financials" },
  { key: "health", label: "Health" },
  { key: "property", label: "Property" },
  { key: "legal", label: "Legal" },
  { key: "education", label: "Education" },
  { key: "other", label: "Other" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// ─── Stats card ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-lg border p-4",
        highlight
          ? "border-amber-200 bg-amber-50"
          : "border-outline-variant bg-surface-container-lowest",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          highlight ? "bg-amber-100" : "bg-primary/10",
        ].join(" ")}
      >
        <Icon size={20} className={highlight ? "text-amber-600" : "text-primary"} />
      </span>
      <div className="min-w-0">
        <p className="text-label-sm text-on-surface-variant">{label}</p>
        <p
          className={[
            "font-display text-title-md",
            highlight ? "text-amber-700" : "text-on-surface",
          ].join(" ")}
        >
          {value}
        </p>
        {sub && <p className="text-label-sm text-on-surface-variant">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Vault Health widget ──────────────────────────────────────────────────────

const IMPORTANT_CATEGORIES: VaultCategory[] = [
  "identity",
  "vehicles",
  "insurance",
  "financial",
];

function VaultHealthWidget() {
  const { data } = useQuery({
    queryKey: ["documents", "vault-health"],
    queryFn: getVaultHealth,
    staleTime: 60_000,
  });

  if (!data) return null;

  const score = data.completeness_score ?? 0;
  const presentCategories = new Set(data.categories.map((c) => c.category));

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
      <h3 className="mb-3 font-display text-title-md text-on-surface">
        Vault Health
      </h3>

      {/* Score bar */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-label-md">
          <span className="text-on-surface-variant">Completeness</span>
          <span className="font-medium text-primary">{score}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Category checklist */}
      <ul className="space-y-1.5">
        {IMPORTANT_CATEGORIES.map((cat) => {
          const present = presentCategories.has(cat);
          return (
            <li key={cat} className="flex items-center gap-2 text-label-md">
              <span
                className={[
                  "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
                  present ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant",
                ].join(" ")}
              >
                {present ? "✓" : "·"}
              </span>
              <span
                className={present ? "text-on-surface capitalize" : "text-on-surface-variant capitalize"}
              >
                {cat}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Woles Tip card ───────────────────────────────────────────────────────────

function WolesTip({ health }: { health: { categories: Array<{ category: VaultCategory; count: number }> } | undefined }) {
  if (!health) return null;

  const presentCategories = new Set(health.categories.map((c) => c.category));
  const missing = IMPORTANT_CATEGORIES.filter((c) => !presentCategories.has(c));

  if (missing.length === 0) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <Lightbulb size={18} className="mt-0.5 shrink-0 text-amber-600" />
      <div>
        <p className="mb-0.5 font-display text-label-lg text-amber-800">
          Woles Tip
        </p>
        <p className="text-label-md text-amber-700">
          Add your <span className="font-medium">{missing.join(", ")}</span> documents to
          improve your vault completeness score.
        </p>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <FileText size={32} className="text-primary" />
      </span>
      <p className="mb-1 font-display text-title-lg text-on-surface">
        No documents yet
      </p>
      <p className="mb-6 max-w-xs text-body-md text-on-surface-variant">
        Upload your first document to keep all your important files in one place.
      </p>
      <button
        onClick={onUpload}
        className="rounded-lg bg-primary px-5 py-2.5 text-label-md text-on-primary shadow hover:brightness-110"
      >
        Upload Document
      </button>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
      <div className="mb-3 flex justify-between">
        <div className="h-10 w-10 rounded-full bg-surface-container" />
        <div className="h-6 w-6 rounded-full bg-surface-container" />
      </div>
      <div className="mb-2 h-4 w-3/4 rounded bg-surface-container" />
      <div className="h-3 w-1/2 rounded bg-surface-container" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchInput, setSearchInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<Document | null>(null);

  const search = useDebounce(searchInput, 300);

  const { data: docsData, isLoading: docsLoading } = useQuery({
    queryKey: ["documents", activeTab, search],
    queryFn: () =>
      listDocuments({
        ...(activeTab !== "all" ? { vault_category: activeTab as VaultCategory } : {}),
        ...(search ? { search } : {}),
      }),
  });

  const { data: expiringData } = useQuery({
    queryKey: ["documents", "expiring"],
    queryFn: () => listDocuments({ expiry_within_days: 30 }),
    staleTime: 60_000,
  });

  const { data: storage } = useQuery({
    queryKey: ["documents", "storage"],
    queryFn: getStorageUsage,
    staleTime: 60_000,
  });

  const { data: health } = useQuery({
    queryKey: ["documents", "vault-health"],
    queryFn: getVaultHealth,
    staleTime: 60_000,
  });

  const documents = docsData?.documents ?? [];
  const expiringCount = expiringData?.documents?.length ?? 0;

  function openUpload() {
    setEditDoc(null);
    setModalOpen(true);
  }

  function openEdit(d: Document) {
    setEditDoc(d);
    setModalOpen(true);
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* ── Header ─── */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-display-sm text-on-surface">
            Document Vault
          </h1>
          <button
            onClick={openUpload}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-label-md text-on-primary shadow hover:brightness-110"
          >
            Upload New
          </button>
        </div>

        {/* ── Stats row ─── */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={AlertTriangle}
            label="Expiring Soon"
            value={expiringCount}
            sub="within 30 days"
            highlight={expiringCount > 0}
          />
          <StatCard
            icon={Shield}
            label="Security Status"
            value="Protected"
            sub="All files encrypted"
          />
          <StatCard
            icon={HardDrive}
            label="Cloud Storage"
            value={storage ? formatBytes(storage.used_bytes) : "—"}
            sub={storage ? `${storage.file_count} file${storage.file_count !== 1 ? "s" : ""}` : undefined}
          />
        </div>

        {/* ── Woles Tip ─── */}
        <div className="mb-6">
          <WolesTip health={health} />
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
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
            placeholder="Search documents…"
            className="w-full rounded-lg border border-outline-variant bg-surface py-2.5 pl-9 pr-4 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* ── Filter tabs ─── */}
        <div className="mb-6 flex gap-1 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
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

        {/* ── Content + sidebar ─── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_240px]">
          {/* Main grid */}
          <div>
            {docsLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <EmptyState onUpload={openUpload} />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {documents.map((d) => (
                  <DocumentCard key={d.id} doc={d} onEdit={openEdit} />
                ))}
                <AddDocumentCard onClick={openUpload} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <VaultHealthWidget />
          </aside>
        </div>

        {/* Vault health on mobile (below grid) */}
        <div className="mt-6 lg:hidden">
          <VaultHealthWidget />
        </div>
      </div>

      {/* ── Upload / Edit Modal ─── */}
      <UploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        document={editDoc}
      />
    </>
  );
}
