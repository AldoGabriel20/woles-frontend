"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const TABS = [
  { href: "/finances/goals", label: "Goal Tracker" },
  { href: "/finances/overview", label: "Financial Overview" },
];

export default function FinancesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-col">
      {/* Tab bar */}
      <div className="border-b border-outline-variant bg-surface">
        <div className="mx-auto flex max-w-6xl gap-0 px-4">
          {TABS.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={[
                  "relative px-5 py-3.5 text-label-lg font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-on-surface",
                ].join(" ")}
              >
                {tab.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
