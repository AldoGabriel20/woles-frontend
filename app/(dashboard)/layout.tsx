import type { ReactNode } from "react";

import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      {/*
       * Layout structure:
       *
       *  ┌──────────────────────────────────────────┐
       *  │  [Topbar — mobile only, fixed top h-14]  │
       *  ├──────────┬───────────────────────────────┤
       *  │          │                               │
       *  │ Sidebar  │          <main>               │
       *  │ lg:fixed │   p-6  (content area)         │
       *  │  w-60    │                               │
       *  │          │                               │
       *  └──────────┴───────────────────────────────┘
       *  │  [MobileNav — mobile only, fixed bottom] │
       *  └──────────────────────────────────────────┘
       */}
      <div className="min-h-screen bg-surface">
        {/* Desktop sidebar (fixed, 240px) */}
        <Sidebar />

        {/* Mobile top bar (fixed, h-14 = 56px) */}
        <Topbar />

        {/*
         * Main scrollable content area.
         * – Desktop: left margin 240px to clear the fixed sidebar; p-6 all sides.
         * – Mobile:  pt accounts for fixed topbar (56px + 24px gap = 80px);
         *            pb accounts for fixed bottom nav (56px + 24px gap = 80px).
         */}
        <main className="overflow-y-auto p-6 pt-20 pb-20 lg:ml-60 lg:pt-6 lg:pb-6">
          {children}
        </main>

        {/* Mobile bottom navigation (fixed, h-14 = 56px) */}
        <MobileNav />
      </div>
    </Providers>
  );
}
