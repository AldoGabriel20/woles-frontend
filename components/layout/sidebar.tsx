"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CreditCard,
  DollarSign,
  FileText,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/lib/auth/useAuth";
import { getChatUsage } from "@/lib/api/chat";
import type { User } from "@/lib/api/types";

// ─── Design-system plan badge colours ──────────────────────────────────────

const PLAN_BADGE: Record<User["plan"], string> = {
  free: "bg-surface-container text-on-surface-variant",
  premium: "bg-surface-container text-secondary",
  advanced: "bg-primary-container text-on-primary-container",
};

// ─── Nav items ──────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** When set, the item is only shown to users on one of these plans. */
  plans?: Array<User["plan"]>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Reminders", href: "/dashboard/reminders", icon: Bell },
  { label: "Documents", href: "/dashboard/documents", icon: FileText },
  { label: "Finances", href: "/dashboard/finances", icon: DollarSign },
  { label: "AI Chat Hub", href: "/dashboard/chat", icon: MessageCircle },
  {
    label: "Family",
    href: "/dashboard/family",
    icon: Users,
    plans: ["advanced"],
  },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

// ─── UserAvatar ───────────────────────────────────────────────────────────────

interface UserAvatarProps {
  name: string;
  avatarUrl: string | null;
  size?: number;
}

function UserAvatar({ name, avatarUrl, size = 32 }: UserAvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        className="flex-shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      style={{ width: size, height: size, minWidth: size }}
      className="inline-flex flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-on-primary"
    >
      {initials}
    </span>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const { data: chatUsage } = useQuery({
    queryKey: ["chat", "usage"],
    queryFn: getChatUsage,
    enabled: !!user && user.plan === "free",
    staleTime: 5 * 60_000,
  });

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.plans) return true;
    return user ? item.plans.includes(user.plan) : false;
  });

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-outline-variant bg-surface-container-lowest lg:flex">
      {/* ── Logo ── */}
      <div className="flex h-16 flex-shrink-0 items-center border-b border-outline-variant px-5">
        <Link href="/dashboard">
          <Image
            src="/logo/woles_horizontal_logo_uniform.png"
            alt="Woles"
            width={120}
            height={32}
            className="object-contain"
            priority
          />
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {visibleItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            const isChatItem = item.href === "/dashboard/chat";

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "flex items-center gap-3 rounded-md px-3 py-2 text-label-md transition-colors",
                    active
                      ? "bg-primary-container text-on-primary-container"
                      : "text-on-surface-variant hover:bg-surface-container",
                  ].join(" ")}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {isChatItem && user?.plan === "free" && chatUsage && (
                    <span className="text-label-sm text-on-surface-variant">
                      {chatUsage.messages_used}/{chatUsage.quota}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Footer ── */}
      <div className="flex-shrink-0 space-y-3 border-t border-outline-variant p-3">
        {user?.plan === "free" && (
          <Link
            href="/billing/checkout"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-label-md text-on-primary transition-colors hover:opacity-90"
          >
            <CreditCard size={16} />
            Upgrade Now
          </Link>
        )}

        <div className="flex items-center gap-3 px-1">
          <UserAvatar
            name={user?.name ?? ""}
            avatarUrl={user?.avatar_url ?? null}
            size={32}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-label-md text-on-surface">
              {user?.name ?? "—"}
            </p>
            <span
              className={[
                "mt-0.5 inline-flex rounded-full px-2 py-0.5 text-label-sm",
                PLAN_BADGE[user?.plan ?? "free"],
              ].join(" ")}
            >
              {(user?.plan ?? "free").toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
