"use client";

import { Globe } from "lucide-react";

const INTEGRATIONS = [
  {
    key: "google",
    icon: "🔵",
    name: "Google Workspace",
    description: "Sync calendar events and tasks",
  },
  {
    key: "financial",
    icon: "🏦",
    name: "Financial Data (Plaid)",
    description: "Connect bank accounts for automatic tracking",
  },
  {
    key: "smarthome",
    icon: "🏠",
    name: "Smart Home Hub",
    description: "Automate reminders from device triggers",
  },
];

export function ConnectivitySection() {
  return (
    <section className="space-y-6 p-6">
      <div>
        <h2 className="font-display text-title-lg text-on-surface">Connectivity</h2>
        <p className="mt-0.5 text-body-md text-on-surface-variant">
          Connect external services to enhance your experience.
        </p>
      </div>

      <ul className="space-y-3">
        {INTEGRATIONS.map((intg) => (
          <li
            key={intg.key}
            className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-2xl">
                {intg.icon}
              </div>
              <div>
                <p className="font-display text-label-lg text-on-surface">{intg.name}</p>
                <p className="text-label-md text-on-surface-variant">{intg.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-label-sm text-on-surface-variant">Disconnected</span>
              {/* Disabled toggle */}
              <button
                type="button"
                disabled
                title="Coming in a future update"
                aria-label={`Connect ${intg.name}`}
                className="relative inline-flex h-5 w-9 cursor-not-allowed items-center rounded-full bg-outline-variant opacity-50"
              >
                <span className="inline-block h-3.5 w-3.5 translate-x-0.5 rounded-full bg-white transition" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container px-4 py-3">
        <Globe size={16} className="shrink-0 text-on-surface-variant" />
        <p className="text-label-md text-on-surface-variant">
          Third-party integrations are coming soon. Stay tuned for updates.
        </p>
      </div>
    </section>
  );
}
