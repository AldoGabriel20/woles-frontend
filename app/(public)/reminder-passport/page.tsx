import type { Metadata } from "next";
import { SeoPageTemplate } from "@/components/landing/seo-page-template";

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6281234567890"}?text=Ingatkan+passport+saya`;

const FAQS = [
  {
    q: "Berapa lama masa berlaku passport Indonesia?",
    a: "Passport Indonesia berlaku selama 10 tahun sejak tanggal penerbitan. Setelah habis, harus diperpanjang di kantor imigrasi.",
  },
  {
    q: "Kapan harus perpanjang passport sebelum perjalanan?",
    a: "Sebagian besar negara mensyaratkan passport minimal berlaku 6 bulan dari tanggal kedatangan. Perpanjang setidaknya 6 bulan sebelum rencana perjalanan internasional.",
  },
  {
    q: "Berapa biaya perpanjang passport?",
    a: "Biaya perpanjangan passport biasa Rp350.000 dan passport elektronik Rp650.000 di kantor imigrasi.",
  },
  {
    q: "Bagaimana cara set reminder passport di Woles?",
    a: 'Chat Woles: "Passport saya habis 20 Juni 2028." Woles akan mengingatkan kamu setahun sebelum, 6 bulan sebelum, dan 1 bulan sebelum kadaluarsa.',
  },
  {
    q: "Bisakah daftar antrian imigrasi online?",
    a: "Ya, pendaftaran antrian imigrasi bisa dilakukan via aplikasi M-Paspor atau website Dirjen Imigrasi. Daftar jauh-jauh hari karena antrian bisa penuh.",
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
  title: "Reminder Perpanjang Passport via WhatsApp — Woles",
  description:
    "Jangan sampai passport kadaluarsa saat mau traveling. Set reminder perpanjang passport otomatis via WhatsApp dengan Woles.",
  keywords: [
    "reminder passport",
    "pengingat perpanjang passport",
    "passport kadaluarsa whatsapp",
  ],
  alternates: { canonical: "https://woles.id/reminder-passport" },
  openGraph: {
    title: "Reminder Perpanjang Passport via WhatsApp — Woles",
    description:
      "Jangan sampai rencana traveling gagal karena passport kadaluarsa. Set reminder sekarang.",
    locale: "id_ID",
  },
};

export default function ReminderPassportPage() {
  return (
    <SeoPageTemplate
      title="Reminder Perpanjang Passport via WhatsApp"
      subtitle="Passport kadaluarsa bisa gagalkan rencana traveling internasional. Set reminder jauh-jauh hari agar tidak terburu-buru."
      problem="Passport berlaku 10 tahun sehingga mudah terlupa. Masalah muncul saat mendadak ada kesempatan perjalanan internasional tapi passport sudah kadaluarsa atau kurang dari 6 bulan — bisa ditolak boarding. Mengurus passport mendadak berarti antri panjang dan biaya ekstra."
      solution="Cukup ceritakan tanggal habis passport kamu ke Woles via WhatsApp. Woles akan mengingatkan kamu setahun sebelum, 6 bulan sebelum, dan 30 hari sebelum — cukup waktu untuk antri perpanjangan tanpa terburu-buru."
      waBubble={{
        user: "Passport saya habis 20 Juni 2028",
        bot: "Saved ✅ Saya akan mengingatkan kamu pada Juni 2027, Desember 2027, dan Mei 2028 untuk perpanjang passport.",
      }}
      benefits={[
        "Reminder jauh sebelum kadaluarsa — cukup waktu antri imigrasi",
        "Hindari gagal boarding karena passport kurang 6 bulan masa berlaku",
        "Tidak perlu ingat tanggal — Woles yang jaga",
        "Berlaku juga untuk visa dan dokumen perjalanan lain",
        "Langsung via WhatsApp — mudah dan cepat",
      ]}
      faqs={FAQS}
      ctaText="Mulai Reminder Passport via WhatsApp"
      waLink={WA_LINK}
      relatedLinks={[
        { href: "/reminder-sim", label: "Reminder SIM" },
        { href: "/reminder-stnk", label: "Reminder STNK" },
        { href: "/reminder-pajak-mobil", label: "Reminder Pajak Mobil" },
        { href: "/whatsapp-reminder", label: "Semua Reminder via WhatsApp" },
      ]}
      faqJsonLd={faqJsonLd}
    />
  );
}
