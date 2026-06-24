"use client";

import { useRef, useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteFamilyMember } from "@/lib/api/family";
import type { FamilyMember, FamilyRole } from "@/lib/api/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const ROLE_COLORS: Record<FamilyRole, string> = {
  spouse: "bg-rose-100 text-rose-700",
  child: "bg-sky-100 text-sky-700",
  parent: "bg-purple-100 text-purple-700",
  sibling: "bg-amber-100 text-amber-700",
  other: "bg-surface-container text-on-surface-variant",
};

const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-teal-500",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// ─── Member Card ──────────────────────────────────────────────────────────────

interface MemberCardProps {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
}

export function MemberCard({ member, onEdit }: MemberCardProps) {
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteFamilyMember(member.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family", "members"] });
    },
  });

  const initials = getInitials(member.name);
  const bgColor = avatarColor(member.name);

  return (
    <div
      className="relative flex flex-col items-center rounded-xl border border-outline-variant bg-surface-container-lowest p-5 text-center transition-shadow hover:shadow-md"
      onMouseLeave={() => setMenuOpen(false)}
    >
      {/* 3-dot menu */}
      <div className="absolute right-3 top-3">
        <button
          onClick={() => setMenuOpen((p) => !p)}
          aria-label="Actions"
          className="flex h-7 w-7 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
        >
          <MoreVertical size={16} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 z-10 min-w-[130px] rounded-lg border border-outline-variant bg-surface-container-lowest py-1 shadow-lg">
            <button
              onClick={() => {
                setMenuOpen(false);
                onEdit(member);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-label-md text-on-surface hover:bg-surface-container"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                if (
                  confirm(
                    `Remove "${member.name}"? Removing this member will transfer their items to your account.`,
                  )
                ) {
                  deleteMutation.mutate();
                }
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-label-md text-error hover:bg-surface-container"
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div
        className={[
          "mb-3 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white",
          bgColor,
        ].join(" ")}
      >
        {initials}
      </div>

      {/* Name */}
      <p className="mb-1 font-display text-title-md text-on-surface">
        {member.name}
      </p>

      {/* Relation label */}
      {member.relation_label && (
        <p className="mb-2 text-label-md text-on-surface-variant">
          {member.relation_label}
        </p>
      )}

      {/* Role badge */}
      <span
        className={[
          "rounded-full px-3 py-0.5 text-label-sm font-medium capitalize",
          ROLE_COLORS[member.role] ?? ROLE_COLORS.other,
        ].join(" ")}
      >
        {member.role}
      </span>
    </div>
  );
}
