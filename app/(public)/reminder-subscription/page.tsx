import type { Metadata } from "next";
import { SeoPageTemplate } from "@/components/landing/seo-page-template";

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6281234567890"}?text=Ingatkan+langganan+saya`;

const FAQS = [
  {
    q: "Mengapa saya perlu reminder untuk langganan?",
    a: "Banyak layanan digital (Netflix, Spotify, gym) memungut bayaran otomatis setiap bulan. Tanpa reminder, kamu bisa membayar layanan yang sudah tidak kamu gunakan selama berbulan-bulan.",
  },
  {
    q: "Berapa banyak langganan rata-rata orang Indonesia?",
    a: "Rata-rata orang memiliki 5-10 layanan berlangganan aktif, dengan total biaya Rp200.000–Rp1.000.000 per bulan. Banyak yang lupa beberapa di antaranya.",
  },
  {
    q: "Bagaimana cara set reminder langganan di Woles?",
    a: 'Chat Woles: "Ingatkan bayar Netflix tiap tanggal 15" atau "Langganan gym saya renewal 1 bulan lagi." Woles otomatis jadwalkan.',
  },
  {
    q: "Bisakah set reminder untuk semua langganan sekaligus?",
    a: "Ya. Kirim satu pesan per langganan ke Woles. Kamu bisa tambahkan sebanyak apapun langganan — Netflix, Spotify, Canva, gym, dll.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const metadata: Metadata = {
  title: "Reminder Langganan & Subscription via WhatsApp — Woles",
  description:
    "Lacak semua langganan bulanan (Netflix, Spotify, gym) dan ingatkan sebelum tagihan jatuh tempo. Set otomatis via WhatsApp dengan Woles.",
  keywords: [
    "reminder langganan",
    "pengingat subscription",
    "reminder netflix spotify whatsapp",
    "lacak langganan bulanan",
  ],
  alternates: { canonical: "https://woles.id/reminder-subscription" },
  openGraph: {
    title: "Reminder Langganan & Subscription via WhatsApp — Woles",
    description:
      "Lacak semua langganan bulanan dan ingatkan sebelum tagihan jatuh tempo via WhatsApp.",
    locale: "id_ID",
  },
};

export default function ReminderSubscriptionPage() {
  return (
    <SeoPageTemplate
      title="Reminder Langganan & Subscription via WhatsApp"
      subtitle="Lacak Netflix, Spotify, gym, dan semua langgananmu. Tidak ada lagi bayar tanpa sadar untuk layanan yang tidak dipakai."
      problem="Rata-rata orang punya 5-10 layanan berlangganan aktif — Netflix, Spotify, Canva, gym, iCloud, dan lainnya. Karena sistem auto-debit, banyak yang membayar langganan yang sudah tidak digunakan selama berbulan-bulan. Akumulasinya bisa jutaan rupiah setahun yang terbuang."
      solution="Daftarkan semua langgananmu ke Woles via WhatsApp. Woles akan mengingatkan kamu setiap bulan sebelum tagihan datang, sehingga kamu bisa memutuskan apakah ingin lanjut atau batalkan berlangganan."
      waBubble={{
        user: "Ingatkan bayar Netflix tiap tanggal 15",
        bot: "Saved ✅ Saya akan mengingatkan kamu setiap tanggal 14 (H-1) untuk bayar Netflix.",
      }}
      benefits={[
        "Lacak semua langganan di satu tempat via WhatsApp",
        "Ingatkan sebelum tagihan otomatis — hindari bayar layanan yang tidak dipakai",
        "Set reminder untuk semua platform: streaming, gym, software, dll",
        "Dashboard web untuk melihat total pengeluaran langganan per bulan",
        "Gratis untuk mulai, tanpa kartu kredit",
      ]}
      faqs={FAQS}
      ctaText="Mulai Lacak Langganan via WhatsApp"
      waLink={WA_LINK}
      relatedLinks={[
        { href: "/reminder-pajak-mobil", label: "Reminder Pajak Mobil" },
        { href: "/reminder-stnk", label: "Reminder STNK" },
        { href: "/whatsapp-reminder", label: "Semua Reminder via WhatsApp" },
        { href: "/", label: "Beranda Woles" },
      ]}
      faqJsonLd={faqJsonLd}
    />
  );
}
