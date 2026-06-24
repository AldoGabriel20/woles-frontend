import type { Metadata } from "next";
import { SeoPageTemplate } from "@/components/landing/seo-page-template";

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6281234567890"}?text=Ingatkan+servis+mobil+saya`;

const FAQS = [
  {
    q: "Seberapa sering harus servis mobil?",
    a: "Umumnya setiap 10.000 km atau 6 bulan sekali untuk servis rutin (ganti oli, filter). Servis besar biasanya setiap 20.000-40.000 km. Cek buku manual kendaraanmu untuk jadwal spesifik.",
  },
  {
    q: "Apa risiko jika melewatkan servis rutin?",
    a: "Risiko kerusakan mesin lebih besar, konsumsi BBM meningkat, performa menurun, dan biaya perbaikan bisa jauh lebih mahal dari biaya servis rutin yang terlewat.",
  },
  {
    q: "Bagaimana cara set reminder servis di Woles?",
    a: 'Kirim ke Woles: "Ingatkan servis mobil 6 bulan sekali mulai bulan ini." Atau "Servis terakhir 10 Januari, ingatkan lagi 6 bulan kemudian."',
  },
  {
    q: "Bisakah set reminder berdasarkan kilometer?",
    a: "Saat ini Woles mendukung reminder berbasis waktu (interval bulan). Reminder berbasis kilometer akan segera hadir.",
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
  title: "Reminder Servis Mobil Otomatis via WhatsApp — Woles",
  description:
    "Jangan sampai lupa servis rutin dan merusak mesin. Set reminder servis mobil otomatis setiap 6 bulan via WhatsApp dengan Woles.",
  keywords: [
    "reminder servis mobil",
    "pengingat servis kendaraan",
    "servis rutin otomatis whatsapp",
  ],
  alternates: { canonical: "https://woles.id/reminder-servis-mobil" },
  openGraph: {
    title: "Reminder Servis Mobil Otomatis via WhatsApp — Woles",
    description:
      "Set reminder servis rutin otomatis setiap 6 bulan via WhatsApp. Jaga mesin tetap prima.",
    locale: "id_ID",
  },
};

export default function ReminderServisMobilPage() {
  return (
    <SeoPageTemplate
      title="Reminder Servis Mobil Otomatis via WhatsApp"
      subtitle="Servis rutin menjaga mesin tetap prima dan mencegah kerusakan mahal. Set sekali, Woles ingatkan setiap 6 bulan."
      problem="Jadwal servis rutin mudah terlupakan di tengah kesibukan sehari-hari. Banyak orang baru ingat servis setelah ada masalah pada kendaraan — yang biasanya sudah lebih parah dan lebih mahal ditangani. Tidak ada notifikasi otomatis dari bengkel."
      solution="Ceritakan kapan terakhir kamu servis atau minta Woles ingatkan setiap N bulan. Woles akan mengirim WhatsApp tepat waktu sehingga kamu bisa booking bengkel sebelum jadwal padat."
      waBubble={{
        user: "Ingatkan servis mobil saya 6 bulan sekali mulai bulan ini",
        bot: "Saved ✅ Saya akan mengingatkan kamu setiap 6 bulan untuk servis rutin mobil. Reminder pertama pada 6 bulan dari sekarang.",
      }}
      benefits={[
        "Reminder berulang otomatis — set sekali, berlaku terus",
        "Interval bisa disesuaikan: 3 bulan, 6 bulan, atau sesuai jadwal bengkel",
        "Jaga kondisi kendaraan tetap prima, hemat biaya jangka panjang",
        "Langsung via WhatsApp tanpa app tambahan",
        "Berlaku untuk mobil, motor, dan kendaraan lainnya",
      ]}
      faqs={FAQS}
      ctaText="Mulai Reminder Servis Mobil via WhatsApp"
      waLink={WA_LINK}
      relatedLinks={[
        { href: "/reminder-stnk", label: "Reminder STNK" },
        { href: "/reminder-pajak-mobil", label: "Reminder Pajak Mobil" },
        { href: "/reminder-sim", label: "Reminder SIM" },
        { href: "/whatsapp-reminder", label: "Semua Reminder via WhatsApp" },
      ]}
      faqJsonLd={faqJsonLd}
    />
  );
}
