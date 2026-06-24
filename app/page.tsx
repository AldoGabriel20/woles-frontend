import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FaqAccordion } from "@/components/landing/faq-accordion";

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Woles — Semua Urusan Hidup, Satu Chat Aja",
  description:
    "Ingatkan tagihan, dokumen penting, dan target keuangan — cukup dari WhatsApp. Tanpa install app.",
  keywords: ["reminder whatsapp", "pengingat tagihan", "woles app", "reminder otomatis indonesia"],
  alternates: { canonical: "https://woles.id" },
  openGraph: {
    title: "Woles — Semua Urusan Hidup, Satu Chat Aja",
    description:
      "Ingatkan tagihan, dokumen penting, dan target keuangan — cukup dari WhatsApp. Tanpa install app.",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/logo/woles_primary_logo_uniform.png", width: 1200, height: 630 }],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6281234567890"}?text=Halo+Woles`;

// ─── Pain points ─────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  { icon: "🪪", label: "SIM Expired" },
  { icon: "🚗", label: "STNK Mati" },
  { icon: "💰", label: "Pajak Mobil" },
  { icon: "🔧", label: "Servis Rutin" },
  { icon: "📺", label: "Subscription" },
  { icon: "📋", label: "Tagihan" },
];

// ─── Categories ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { icon: "🚗", label: "STNK" },
  { icon: "🪪", label: "SIM" },
  { icon: "💸", label: "Pajak" },
  { icon: "🔧", label: "Servis Mobil" },
  { icon: "🛂", label: "Passport" },
  { icon: "📋", label: "Tagihan" },
  { icon: "📺", label: "Langganan" },
  { icon: "💳", label: "Cicilan" },
];

// ─── Trust cards ─────────────────────────────────────────────────────────────

const TRUST = [
  {
    icon: "🔒",
    title: "Data Pribadi Aman",
    desc: "Data kamu dienkripsi dan tidak pernah dijual ke pihak ketiga.",
  },
  {
    icon: "💬",
    title: "WhatsApp-First",
    desc: "Tidak perlu install app baru. Cukup chat di WhatsApp yang sudah kamu pakai.",
  },
  {
    icon: "❤️",
    title: "Reliable & Human",
    desc: "Reminder sampai tepat waktu dengan pesan yang terasa personal, bukan spam.",
  },
];

// ─── Pricing ─────────────────────────────────────────────────────────────────

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  ctaHref: string;
  highlighted: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "Rp0",
    period: "/bulan",
    description: "Mulai tanpa kartu kredit.",
    highlighted: false,
    cta: "Mulai Gratis",
    ctaHref: WA_LINK,
    features: [
      { text: "20 reminder", included: true },
      { text: "5 dokumen tersimpan", included: true },
      { text: "5 langganan", included: true },
      { text: "Reminder via WhatsApp", included: true },
      { text: "Dashboard web", included: true },
      { text: "Goal tracker", included: false },
      { text: "Manajemen keluarga", included: false },
      { text: "AI assistant", included: false },
    ],
  },
  {
    name: "Premium",
    price: "Rp39.000",
    period: "/bulan",
    description: "Untuk kamu yang sudah mengandalkan Woles setiap hari.",
    highlighted: true,
    cta: "Mulai Premium",
    ctaHref: "/register",
    features: [
      { text: "Reminder tidak terbatas", included: true },
      { text: "Dokumen tidak terbatas", included: true },
      { text: "Langganan tidak terbatas", included: true },
      { text: "Goal tracker keuangan", included: true },
      { text: "Life timeline", included: true },
      { text: "Priority reminder delivery", included: true },
      { text: "Manajemen keluarga", included: false },
      { text: "AI assistant suggestions", included: false },
    ],
  },
  {
    name: "Advanced",
    price: "Rp99.000",
    period: "/bulan",
    description: "Untuk keluarga dan manajer rumah tangga aktif.",
    highlighted: false,
    cta: "Mulai Advanced",
    ctaHref: "/register",
    features: [
      { text: "Semua fitur Premium", included: true },
      { text: "Manajemen keluarga", included: true },
      { text: "AI assistant suggestions", included: true },
      { text: "OCR ekstraksi dokumen", included: true },
      { text: "Shared household timeline", included: true },
      { text: "Multiple nomor WhatsApp", included: true },
      { text: "", included: true },
      { text: "", included: true },
    ],
  },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Apakah saya perlu install aplikasi?",
    a: "Tidak. Woles bekerja sepenuhnya via WhatsApp. Kamu bisa langsung chat dan reminder akan datang otomatis. Dashboard web tersedia sebagai tambahan jika kamu mau.",
  },
  {
    q: "Bagaimana cara membuat reminder?",
    a: 'Cukup kirim pesan ke nomor WhatsApp Woles. Contoh: "Ingatkan bayar internet tiap tanggal 10" atau "STNK mobilku habis bulan depan." AI kami akan mencatat dan menjadwalkan.',
  },
  {
    q: "Apakah data saya aman?",
    a: "Ya. Semua data dienkripsi di transit dan saat disimpan. Kami tidak menjual atau membagikan data kamu ke pihak ketiga.",
  },
  {
    q: "Bisa dipakai untuk berapa orang?",
    a: "Free dan Premium untuk 1 pengguna. Advanced memungkinkan manajemen keluarga — kamu bisa menambahkan anggota keluarga dan berbagi reminder.",
  },
  {
    q: "Bagaimana cara upgrade ke Premium atau Advanced?",
    a: "Masuk ke dashboard Woles, buka menu Billing, dan pilih paket yang kamu inginkan. Pembayaran via transfer bank atau kartu.",
  },
  {
    q: "Apakah ada uji coba gratis untuk paket berbayar?",
    a: "Plan Free tersedia selamanya tanpa batas waktu. Kamu bisa upgrade kapan saja saat kebutuhan bertambah.",
  },
];

// ─── FAQ JSON-LD ─────────────────────────────────────────────────────────────

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

// ─── WhatsApp chat mockup ─────────────────────────────────────────────────────

function WaChatMockup() {
  const msgs = [
    { role: "user", text: "Ingatkan bayar internet tiap tanggal 10" },
    {
      role: "bot",
      text: "Saved ✅ Saya akan mengingatkan kamu setiap bulan tanggal 10 untuk bayar internet.",
    },
    { role: "user", text: "STNK mobil saya habis 15 Agustus" },
    {
      role: "bot",
      text: "Saved ✅ Saya akan mengingatkan 30 hari, 7 hari, dan 1 hari sebelum STNK kamu habis.",
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-outline-variant bg-[#E5DDD5] shadow-lg">
      {/* WA header bar */}
      <div className="flex items-center gap-2 bg-[#075E54] px-3 py-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <Image
            src="/logo/woles_app_icon_uniform.png"
            alt="Woles"
            width={24}
            height={24}
            className="rounded-full"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Woles</p>
          <p className="text-xs text-green-200">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-2 px-3 py-3">
        {msgs.map((m, i) => (
          <div key={i} className={["flex", m.role === "user" ? "justify-end" : "justify-start"].join(" ")}>
            <div
              className={[
                "max-w-[75%] rounded-lg px-3 py-1.5 text-sm shadow-sm",
                m.role === "user" ? "bg-[#DCF8C6] text-gray-800" : "bg-white text-gray-800",
              ].join(" ")}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <LandingNavbar />

      <main>
        {/* ── Hero ── */}
        <section className="overflow-hidden bg-gradient-to-b from-primary/5 to-surface pb-16 pt-12 sm:pt-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
              {/* Text */}
              <div className="flex-1 text-center lg:text-left">
                <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-label-sm text-primary">
                  🇮🇩 Dibuat untuk Indonesia
                </span>
                <h1 className="font-display text-[32px] font-bold leading-tight text-on-surface sm:text-[42px] lg:text-[48px]">
                  Semua urusan hidupmu,{" "}
                  <span className="text-primary">satu chat WhatsApp.</span>
                </h1>
                <p className="mt-4 text-body-lg text-on-surface-variant">
                  Ingatkan tagihan, dokumen penting, dan target keuangan — cukup dari WhatsApp.
                  Tanpa install app.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <a
                    href={WA_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-label-lg font-semibold text-white shadow hover:brightness-105"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.557 4.137 1.526 5.876L.057 23.882l6.177-1.619A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.895 0-3.67-.509-5.2-1.393l-.373-.22-3.665.96.979-3.577-.241-.381A9.962 9.962 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                    Mulai via WhatsApp
                  </a>
                  <a
                    href="#how-it-works"
                    className="flex items-center justify-center gap-2 rounded-xl border border-outline-variant px-6 py-3.5 text-label-lg text-on-surface hover:bg-surface-container"
                  >
                    Lihat Demo
                  </a>
                </div>
              </div>

              {/* Mockup */}
              <div className="w-full max-w-xs flex-shrink-0 lg:max-w-sm">
                <WaChatMockup />
              </div>
            </div>
          </div>
        </section>

        {/* ── Pain section ── */}
        <section id="features" className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <h2 className="font-display text-[28px] font-bold text-on-surface sm:text-[32px]">
                Pernah lupa bayar pajak kendaraan? STNK mati mendadak?
              </h2>
              <p className="mt-3 text-body-md text-on-surface-variant">
                Urusan administratif yang sepele tapi bikin stres kalau terlewat. Woles ada untuk
                itu.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {PAIN_POINTS.map((p) => (
                <div
                  key={p.label}
                  className="flex flex-col items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center"
                >
                  <span className="text-3xl">{p.icon}</span>
                  <span className="text-label-md font-medium text-on-surface">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <div className="bg-surface-container-low">
          <HowItWorks />
        </div>

        {/* ── Categories grid ── */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <h2 className="font-display text-[28px] font-bold text-on-surface">
                Apa saja yang bisa diingat?
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {CATEGORIES.map((c) => (
                <div
                  key={c.label}
                  className="flex flex-col items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-5 text-center hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  <span className="text-3xl">{c.icon}</span>
                  <span className="text-label-md font-medium text-on-surface">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust section ── */}
        <section className="bg-primary-container py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <h2 className="font-display text-[28px] font-bold text-on-primary-container">
                Mengapa percaya Woles?
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {TRUST.map((t) => (
                <div
                  key={t.title}
                  className="rounded-2xl bg-white/10 p-6 text-center backdrop-blur-sm"
                >
                  <span className="mb-3 block text-4xl">{t.icon}</span>
                  <h3 className="mb-1.5 font-display text-title-lg text-on-primary-container">
                    {t.title}
                  </h3>
                  <p className="text-label-md text-on-primary-container/70">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <h2 className="font-display text-[28px] font-bold text-on-surface sm:text-[32px]">
                Harga yang transparan
              </h2>
              <p className="mt-2 text-body-md text-on-surface-variant">
                Mulai gratis, upgrade kapan saja.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={[
                    "relative flex flex-col rounded-2xl border p-6",
                    plan.highlighted
                      ? "border-primary bg-primary-container text-on-primary-container shadow-lg ring-2 ring-primary"
                      : "border-outline-variant bg-surface-container-lowest",
                  ].join(" ")}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-label-sm text-on-primary">
                      Paling Populer
                    </span>
                  )}
                  <div className="mb-4">
                    <h3
                      className={[
                        "font-display text-title-lg",
                        plan.highlighted ? "text-on-primary-container" : "text-on-surface",
                      ].join(" ")}
                    >
                      {plan.name}
                    </h3>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span
                        className={[
                          "font-display text-[28px] font-bold",
                          plan.highlighted ? "text-on-primary-container" : "text-on-surface",
                        ].join(" ")}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={[
                          "text-label-md",
                          plan.highlighted
                            ? "text-on-primary-container/70"
                            : "text-on-surface-variant",
                        ].join(" ")}
                      >
                        {plan.period}
                      </span>
                    </div>
                    <p
                      className={[
                        "mt-1 text-label-md",
                        plan.highlighted
                          ? "text-on-primary-container/70"
                          : "text-on-surface-variant",
                      ].join(" ")}
                    >
                      {plan.description}
                    </p>
                  </div>

                  <ul className="mb-6 flex-1 space-y-2">
                    {plan.features.filter((f) => f.text).map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check
                          size={14}
                          className={f.included ? "text-[#25D366] shrink-0" : "text-outline-variant shrink-0"}
                        />
                        <span
                          className={[
                            "text-label-md",
                            !f.included
                              ? "text-on-surface-variant line-through opacity-50"
                              : plan.highlighted
                              ? "text-on-primary-container"
                              : "text-on-surface",
                          ].join(" ")}
                        >
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={plan.ctaHref}
                    target={plan.ctaHref.startsWith("https") ? "_blank" : undefined}
                    rel={plan.ctaHref.startsWith("https") ? "noopener noreferrer" : undefined}
                    className={[
                      "block rounded-xl py-3 text-center text-label-lg font-semibold transition",
                      plan.highlighted
                        ? "bg-white text-primary hover:bg-white/90"
                        : "bg-primary text-on-primary hover:brightness-110",
                    ].join(" ")}
                  >
                    {plan.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="bg-surface-container-low py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <h2 className="font-display text-[28px] font-bold text-on-surface">
                Pertanyaan yang sering ditanya
              </h2>
            </div>
            <FaqAccordion items={FAQS} />
          </div>
        </section>

        {/* ── CTA section ── */}
        <section className="bg-primary py-16 text-center">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="font-display text-[28px] font-bold text-on-primary sm:text-[32px]">
              Siap untuk hidup lebih santai?
            </h2>
            <p className="mt-3 text-body-md text-on-primary/80">
              Bergabung dengan ribuan pengguna yang sudah mempercayakan urusan admin harian mereka ke
              Woles.
            </p>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-label-lg font-semibold text-primary shadow hover:bg-white/90"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.557 4.137 1.526 5.876L.057 23.882l6.177-1.619A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.895 0-3.67-.509-5.2-1.393l-.373-.22-3.665.96.979-3.577-.241-.381A9.962 9.962 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Mulai Gratis via WhatsApp
            </a>
          </div>
        </section>
      </main>

      <LandingFooter />
    </>
  );
}
