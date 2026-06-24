"use client";

import { useState } from "react";
import { User, Globe, Shield } from "lucide-react";

import { AccountDetailsSection } from "@/components/settings/account-details-section";
import { ConnectivitySection } from "@/components/settings/connectivity-section";
import { SecurityPrivacySection } from "@/components/settings/security-privacy-section";

type Section = "account" | "connectivity" | "security";

const NAV: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: "account", label: "Account Details", icon: <User size={16} /> },
  { key: "connectivity", label: "Connectivity", icon: <Globe size={16} /> },
  { key: "security", label: "Security & Privacy", icon: <Shield size={16} /> },
];

export default function SettingsPage() {
  const [active, setActive] = useState<Section>("account");

  return (
    <div className="flex min-h-screen flex-col bg-surface lg:flex-row">
      {/* ─── Sidebar nav (desktop) ── */}
      <aside className="hidden w-52 shrink-0 border-r border-outline-variant bg-surface-container-lowest lg:block">
        <div className="px-4 py-5">
          <h1 className="font-display text-title-lg text-on-surface">Settings</h1>
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={[
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-label-md transition-colors",
                active === item.key
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-on-surface-variant hover:bg-surface-container",
              ].join(" ")}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ─── Mobile tab bar ── */}
      <div className="flex border-b border-outline-variant bg-surface-container-lowest lg:hidden">
        {NAV.map((item) => (
          <button
            key={item.key}
            onClick={() => setActive(item.key)}
            className={[
              "flex flex-1 flex-col items-center gap-0.5 py-3 text-label-sm transition-colors",
              active === item.key
                ? "border-b-2 border-primary font-medium text-primary"
                : "text-on-surface-variant",
            ].join(" ")}
          >
            {item.icon}
            <span className="hidden xs:block">{item.label}</span>
          </button>
        ))}
      </div>

      {/* ─── Content ── */}
      <main className="flex-1 overflow-y-auto">
        {active === "account" && <AccountDetailsSection />}
        {active === "connectivity" && <ConnectivitySection />}
        {active === "security" && <SecurityPrivacySection />}
      </main>
    </div>
  );
}
