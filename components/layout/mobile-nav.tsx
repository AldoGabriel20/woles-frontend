"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  DollarSign,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/lib/auth/useAuth";

// ─── Nav definitions ──────────────────────────────────────────────────────────

interface BottomItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const BOTTOM_ITEMS: BottomItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Reminders", href: "/reminders", icon: Bell },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Finances", href: "/finances/overview", icon: DollarSign },
];

const MORE_ITEMS: BottomItem[] = [
  { label: "AI Chat Hub", href: "/chat", icon: MessageCircle },
  { label: "Family", href: "/family", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/finances/overview") return pathname.startsWith("/finances");
  return pathname === href || pathname.startsWith(href + "/");
}

// ─── MobileNav ────────────────────────────────────────────────────────────────

export function MobileNav() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleSignOut = async () => {
    setIsMoreOpen(false);
    await logout();
  };

  const closeMore = () => setIsMoreOpen(false);

  return (
    <>
      {/* ── Fixed bottom tab bar ── */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-outline-variant bg-surface-container-lowest lg:hidden"
      >
        <div className="flex">
          {BOTTOM_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-label-sm transition-colors",
                  active ? "text-primary" : "text-on-surface-variant",
                ].join(" ")}
              >
                <span className="relative flex items-center justify-center">
                  <Icon size={22} />
                  {active && (
                    <span className="absolute -bottom-2 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary" />
                  )}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setIsMoreOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isMoreOpen}
            className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-label-sm text-on-surface-variant"
          >
            <Menu size={22} />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* ── Overlay ── */}
      <div
        role="presentation"
        className={[
          "fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-300",
          isMoreOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={closeMore}
      />

      {/* ── Bottom sheet drawer ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="More options"
        className={[
          "fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-surface-container-lowest px-4 pt-4 pb-8 lg:hidden",
          "transition-transform duration-300",
          isMoreOpen ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        {/* Sheet header */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-title-lg font-semibold text-on-surface">
            More
          </span>
          <button
            onClick={closeMore}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
          >
            <X size={20} />
          </button>
        </div>

        {/* More nav items */}
        <ul className="space-y-0.5">
          {MORE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMore}
                  className="flex items-center gap-4 rounded-md px-3 py-3.5 text-body-md text-on-surface hover:bg-surface-container"
                >
                  <Icon size={22} className="flex-shrink-0 text-on-surface-variant" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}

          {/* Sign out */}
          <li>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-4 rounded-md px-3 py-3.5 text-body-md text-error hover:bg-error-container"
            >
              <LogOut size={22} className="flex-shrink-0" />
              <span>Sign Out</span>
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}
