"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, LogOut, Settings } from "lucide-react";

import { useAuth } from "@/lib/auth/useAuth";
import type { User } from "@/lib/api/types";

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
      {initials || "?"}
    </span>
  );
}

// ─── ProfileMenu ─────────────────────────────────────────────────────────────

interface ProfileMenuProps {
  user: User;
  onClose: () => void;
  onSignOut: () => void;
}

function ProfileMenu({ user, onClose, onSignOut }: ProfileMenuProps) {
  return (
    <div className="absolute right-0 top-12 w-52 rounded-lg border border-outline-variant bg-surface-container-lowest py-1 shadow-lg">
      {/* User info */}
      <div className="border-b border-outline-variant px-4 py-2.5">
        <p className="truncate text-label-md font-medium text-on-surface">
          {user.name}
        </p>
        <p className="truncate text-label-sm text-on-surface-variant">
          {user.email}
        </p>
      </div>

      {/* Menu items */}
      <Link
        href="/settings"
        onClick={onClose}
        className="flex items-center gap-3 px-4 py-2.5 text-body-md text-on-surface hover:bg-surface-container"
      >
        <Settings size={18} className="flex-shrink-0 text-on-surface-variant" />
        Settings
      </Link>

      <button
        onClick={onSignOut}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-body-md text-error hover:bg-error-container"
      >
        <LogOut size={18} className="flex-shrink-0" />
        Sign Out
      </button>
    </div>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

export function Topbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click.
  useEffect(() => {
    if (!isMenuOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await logout();
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-20 flex h-14 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-4 lg:hidden">
      {/* Left: Woles app icon */}
      <Link href="/dashboard" aria-label="Go to dashboard">
        <Image
          src="/logo/woles_app_icon_uniform.png"
          alt="Woles"
          width={32}
          height={32}
          className="object-contain"
          priority
        />
      </Link>

      {/* Right: notification bell + profile avatar */}
      <div className="flex items-center gap-1">
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
        >
          <Bell size={22} />
        </Link>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Open profile menu"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full"
          >
            <UserAvatar
              name={user?.name ?? ""}
              avatarUrl={user?.avatar_url ?? null}
              size={32}
            />
          </button>

          {isMenuOpen && user && (
            <ProfileMenu
              user={user}
              onClose={() => setIsMenuOpen(false)}
              onSignOut={handleSignOut}
            />
          )}
        </div>
      </div>
    </header>
  );
}
