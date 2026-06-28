"use client";

import { useState } from "react";
import { Check, Zap, Crown, Rocket } from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";

// ─── Plan data ────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  icon: React.ReactNode;
  color: string;
  highlighted: boolean;
  features: string[];
  cta: string;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "Rp0 / bulan",
    icon: <Zap size={22} />,
    color: "bg-surface-container border-outline-variant",
    highlighted: false,
    features: [
      "20 reminders aktif",
      "5 dokumen tersimpan",
      "5 langganan terlacak",
      "Notifikasi WhatsApp",
      "1 anggota keluarga",
    ],
    cta: "Paket Saat Ini",
  },
  {
    id: "premium",
    name: "Premium",
    price: 39000,
    priceLabel: "Rp39.000 / bulan",
    icon: <Crown size={22} />,
    color: "bg-primary border-primary",
    highlighted: true,
    features: [
      "Reminder tidak terbatas",
      "Dokumen tidak terbatas",
      "Langganan tidak terbatas",
      "Notifikasi WhatsApp prioritas",
      "5 anggota keluarga",
      "Tujuan keuangan",
      "Laporan bulanan",
    ],
    cta: "Upgrade ke Premium",
  },
  {
    id: "advanced",
    name: "Advanced",
    price: 99000,
    priceLabel: "Rp99.000 / bulan",
    icon: <Rocket size={22} />,
    color: "bg-surface-container border-outline-variant",
    highlighted: false,
    features: [
      "Semua fitur Premium",
      "Anggota keluarga tidak terbatas",
      "Asisten AI dengan analitik",
      "OCR dokumen otomatis",
      "Laporan keuangan lanjutan",
      "Prioritas dukungan",
    ],
    cta: "Upgrade ke Advanced",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingCheckoutPage() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const currentPlan = "free"; // TODO: fetch from /api/v1/billing/plan

  function handleUpgrade(planId: string) {
    if (planId === currentPlan) return;
    setSelectedPlan(planId);
    // TODO: integrate payment gateway
    alert(`Fitur pembayaran akan segera hadir. Paket dipilih: ${planId}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="font-display text-display-sm text-on-surface">
          Pilih Paket
        </h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Tingkatkan produktivitas dengan fitur premium Woles
        </p>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan;
          const isSelected = selectedPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border-2 p-6 shadow-sm transition-all ${plan.color} ${
                plan.highlighted ? "scale-[1.02] shadow-lg" : ""
              } ${isSelected ? "ring-2 ring-offset-2 ring-primary" : ""}`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-0.5 text-label-sm font-semibold text-primary shadow">
                  Paling Populer
                </span>
              )}

              {/* Plan header */}
              <div
                className={`mb-4 flex items-center gap-2 ${
                  plan.highlighted ? "text-on-primary" : "text-on-surface"
                }`}
              >
                {plan.icon}
                <span className="font-display text-title-lg">{plan.name}</span>
              </div>

              {/* Price */}
              <p
                className={`mb-6 font-display text-headline-md ${
                  plan.highlighted ? "text-on-primary" : "text-on-surface"
                }`}
              >
                {plan.priceLabel}
              </p>

              {/* Features */}
              <ul className="mb-8 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check
                      size={16}
                      className={`mt-0.5 shrink-0 ${
                        plan.highlighted
                          ? "text-on-primary/80"
                          : "text-primary"
                      }`}
                    />
                    <span
                      className={`text-body-md ${
                        plan.highlighted
                          ? "text-on-primary/90"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrentPlan}
                className={`w-full rounded-xl py-3 text-label-lg font-semibold transition ${
                  isCurrentPlan
                    ? "cursor-not-allowed opacity-60"
                    : plan.highlighted
                    ? "bg-white text-primary hover:bg-white/90"
                    : "bg-primary text-on-primary hover:brightness-110"
                }`}
              >
                {isCurrentPlan ? "Paket Aktif" : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="mt-10 text-center text-body-sm text-on-surface-variant">
        Semua paket termasuk enkripsi end-to-end dan backup otomatis.{" "}
        <span className="text-primary">Batalkan kapan saja.</span>
      </p>
    </div>
  );
}
