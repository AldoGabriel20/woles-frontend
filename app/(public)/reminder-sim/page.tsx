import type { Metadata } from "next";
import { SeoPageTemplate } from "@/components/landing/seo-page-template";

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6281234567890"}?text=Ingatkan+SIM+saya`;

const FAQS = [
  {
    q: "Berapa lama masa berlaku SIM?",
    a: "SIM A dan SIM C berlaku selama 5 tahun sejak tanggal penerbitan. Tidak ada masa tenggang — jika habis, kamu harus membuat SIM baru.",
  },
  {
    q: "Apa yang terjadi jika berkendara dengan SIM expired?",
    a: "Berkendara dengan SIM yang sudah kadaluarsa bisa dikenai tilang. Polisi bisa menilang pengendara meski SIM hanya terlambat satu hari.",
  },
  {
    q: "Bisakah perpanjang SIM setelah expired?",
    a: "Tidak bisa. SIM yang sudah kadaluarsa harus dibuat ulang dari awal, termasuk ujian teori dan praktik. Ini lebih mahal dan memakan waktu.",
  },
  {
    q: "Bagaimana cara set reminder SIM di Woles?",
    a: 'Chat Woles di WhatsApp: "SIM saya habis 15 Mei 2027." Woles akan mengingatkan kamu 30, 7, dan 1 hari sebelum kadaluarsa.',
  },
  {
    q: "Apa yang perlu dibawa saat perpanjang SIM?",
    a: "SIM lama yang masih berlaku, KTP asli, pas foto, dan uang administrasi. Perpanjangan SIM A atau C biasanya Rp80.000.",
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
  title: "Reminder SIM Otomatis via WhatsApp — Jangan Sampai Expired",
  description:
    "SIM expired berarti harus buat ulang dari nol. Set reminder perpanjang SIM otomatis via WhatsApp dengan Woles sebelum terlambat.",
  keywords: ["reminder sim", "pengingat sim expired", "perpanjang sim whatsapp", "sim kadaluarsa"],
  alternates: { canonical: "https://woles.id/reminder-sim" },
  openGraph: {
    title: "Reminder SIM Otomatis via WhatsApp — Jangan Sampai Expired",
    description: "SIM expired berarti harus buat ulang dari nol. Set reminder sebelum terlambat.",
    locale: "id_ID",
  },
};

export default function ReminderSIMPage() {
  return (
    <SeoPageTemplate
      title="Reminder Perpanjang SIM via WhatsApp"
      subtitle="SIM expired tidak bisa diperpanjang — harus buat ulang dari awal. Set reminder sekarang, jangan ambil risiko."
      problem="Banyak pengemudi tidak sadar SIM mereka sudah atau hampir kadaluarsa. Tidak seperti STNK, SIM yang sudah habis masa berlakunya tidak bisa diperpanjang — harus buat baru dari nol termasuk ujian. Ini makan waktu, biaya lebih besar, dan sangat mengganggu aktivitas."
      solution="Cukup ceritakan tanggal habis SIM kamu ke Woles via WhatsApp. Woles akan mengingatkan kamu dengan cukup waktu untuk perpanjang sebelum kadaluarsa — sehingga kamu bisa datang ke Satpas tanpa terburu-buru."
      waBubble={{
        user: "SIM saya habis 15 Mei 2027",
        bot: "Saved ✅ Saya akan mengingatkan kamu pada 15 April, 8 Mei, dan 14 Mei 2027 untuk perpanjang SIM.",
      }}
      benefits={[
        "Reminder jauh hari sebelum SIM kadaluarsa — cukup waktu untuk mengurus",
        "Hindari harus buat SIM dari nol karena terlambat",
        "Berlaku untuk SIM A, SIM C, dan jenis SIM lainnya",
        "Langsung via WhatsApp — tanpa install app tambahan",
        "Gratis untuk dipakai selamanya",
      ]}
      faqs={FAQS}
      ctaText="Mulai Reminder SIM via WhatsApp"
      waLink={WA_LINK}
      relatedLinks={[
        { href: "/reminder-stnk", label: "Reminder STNK" },
        { href: "/reminder-pajak-mobil", label: "Reminder Pajak Mobil" },
        { href: "/reminder-passport", label: "Reminder Passport" },
        { href: "/whatsapp-reminder", label: "Semua Reminder via WhatsApp" },
      ]}
      faqJsonLd={faqJsonLd}
    />
  );
}
