import type { Metadata } from "next";
import { SeoPageTemplate } from "@/components/landing/seo-page-template";

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6281234567890"}?text=Halo+Woles+ingatkan+saya`;

const FAQS = [
  {
    q: "Apa itu Woles?",
    a: "Woles adalah asisten digital berbasis WhatsApp yang membantu kamu mengatur pengingat, dokumen penting, dan keuangan — cukup dengan chat biasa. Tidak perlu install aplikasi baru.",
  },
  {
    q: "Apa saja yang bisa diingat via WhatsApp?",
    a: "Hampir semua hal: pajak kendaraan, STNK, SIM, servis rutin, tagihan bulanan, passport, langganan, jadwal dokter, ulang tahun, dan banyak lagi.",
  },
  {
    q: "Apakah Woles mendukung reminder berulang?",
    a: 'Ya. Kamu bisa set reminder sekali, harian, mingguan, bulanan, atau interval kustom. Contoh: "Ingatkan bayar internet tiap tanggal 10" atau "Servis motor setiap 3 bulan."',
  },
  {
    q: "Apakah ada biaya untuk mulai pakai Woles?",
    a: "Woles tersedia gratis untuk 20 reminder, 5 dokumen, dan 5 langganan. Upgrade ke Premium (Rp39.000/bulan) untuk akses tidak terbatas.",
  },
  {
    q: "Apakah data WhatsApp saya aman?",
    a: "Woles hanya menyimpan konten pesan yang kamu kirim sebagai reminder. Kami tidak membaca atau menyimpan percakapan WhatsApp lainnya. Data dienkripsi.",
  },
  {
    q: "Di WhatsApp mana saya harus chat?",
    a: "Kamu akan mendapatkan nomor WhatsApp Woles saat mendaftar. Simpan nomornya sebagai kontak, lalu mulai chat kapan saja.",
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
  title: "Reminder Otomatis via WhatsApp — Semua Urusan Hidup, Satu Chat",
  description:
    "Set reminder otomatis untuk pajak, STNK, SIM, tagihan, dan semua urusan harian cukup via WhatsApp. Tanpa install app. Mulai gratis.",
  keywords: [
    "reminder whatsapp",
    "pengingat otomatis whatsapp",
    "reminder tagihan whatsapp indonesia",
    "bot whatsapp reminder",
  ],
  alternates: { canonical: "https://woles.id/whatsapp-reminder" },
  openGraph: {
    title: "Reminder Otomatis via WhatsApp — Semua Urusan Hidup, Satu Chat",
    description:
      "Set reminder otomatis untuk semua urusan harian cukup via WhatsApp. Tanpa install app.",
    locale: "id_ID",
  },
};

export default function WhatsAppReminderPage() {
  return (
    <SeoPageTemplate
      title="Reminder Otomatis via WhatsApp untuk Semua Urusan Hidupmu"
      subtitle="Pajak kendaraan, STNK, SIM, tagihan bulanan, servis rutin — semuanya cukup chat di WhatsApp. Tidak perlu install app baru."
      problem="Kita punya begitu banyak hal yang harus diingat: tanggal bayar tagihan, kapan servis kendaraan, kapan STNK habis, kapan harus perpanjang SIM. Aplikasi reminder biasa butuh setup rumit dan mudah ditinggalkan. WhatsApp sudah kamu buka setiap hari — kenapa tidak pakai itu?"
      solution="Woles mengubah WhatsApp jadi asisten pengingat pintar. Cukup chat natural seperti ngobrol biasa, Woles akan memahami maksudmu dan menjadwalkan reminder otomatis. Tidak perlu isi form, tidak perlu belajar perintah khusus."
      waBubble={{
        user: "Ingatkan bayar internet tiap tanggal 10",
        bot: "Saved ✅ Saya akan mengingatkan kamu setiap bulan tanggal 10 untuk bayar internet.",
      }}
      benefits={[
        "Chat natural di WhatsApp — tidak perlu belajar perintah khusus",
        "Reminder sekali atau berulang: harian, mingguan, bulanan, tahunan",
        "Cakup semua kebutuhan: kendaraan, dokumen, tagihan, kesehatan",
        "Notifikasi tepat waktu langsung ke WhatsApp yang sudah kamu pakai",
        "Dashboard web untuk melihat semua reminder dan statistik",
        "Mulai gratis — tidak perlu kartu kredit",
      ]}
      faqs={FAQS}
      ctaText="Mulai Reminder via WhatsApp Sekarang"
      waLink={WA_LINK}
      relatedLinks={[
        { href: "/reminder-pajak-mobil", label: "Pajak Mobil" },
        { href: "/reminder-stnk", label: "STNK" },
        { href: "/reminder-sim", label: "SIM" },
        { href: "/reminder-servis-mobil", label: "Servis Mobil" },
        { href: "/reminder-passport", label: "Passport" },
        { href: "/reminder-subscription", label: "Langganan" },
      ]}
      faqJsonLd={faqJsonLd}
    />
  );
}
