import type { Metadata } from "next";
import { SeoPageTemplate } from "@/components/landing/seo-page-template";

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6281234567890"}?text=Ingatkan+pajak+mobil+saya`;

const FAQS = [
  {
    q: "Kapan waktunya bayar pajak mobil?",
    a: "Pajak kendaraan bermotor harus dibayar setiap tahun sesuai tanggal STNK. Keterlambatan akan dikenai denda 2% per bulan.",
  },
  {
    q: "Berapa denda keterlambatan bayar pajak mobil?",
    a: "Denda pajak kendaraan sebesar 2% dari pokok pajak per bulan keterlambatan, dihitung dari tanggal jatuh tempo.",
  },
  {
    q: "Bagaimana cara set reminder pajak mobil di Woles?",
    a: 'Cukup kirim pesan ke Woles via WhatsApp, misalnya "Pajak mobil saya jatuh tempo 20 Agustus." Woles akan otomatis mengingatkan kamu 30, 7, dan 1 hari sebelumnya.',
  },
  {
    q: "Apakah Woles bisa untuk lebih dari satu kendaraan?",
    a: "Ya. Kamu bisa menambahkan reminder untuk semua kendaraan yang kamu miliki. Cukup kirim pesan untuk setiap kendaraan.",
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
  title: "Reminder Pajak Mobil Otomatis via WhatsApp — Woles",
  description:
    "Jangan sampai telat bayar pajak kendaraan. Set reminder otomatis via WhatsApp dengan Woles. Ingatkan 30, 7, dan 1 hari sebelum jatuh tempo.",
  keywords: ["reminder pajak mobil", "pengingat pajak kendaraan", "bayar pajak otomatis whatsapp"],
  alternates: { canonical: "https://woles.id/reminder-pajak-mobil" },
  openGraph: {
    title: "Reminder Pajak Mobil Otomatis via WhatsApp — Woles",
    description:
      "Jangan sampai telat bayar pajak kendaraan. Set reminder otomatis via WhatsApp dengan Woles.",
    locale: "id_ID",
  },
};

export default function ReminderPajakMobilPage() {
  return (
    <SeoPageTemplate
      title="Reminder Pajak Mobil Otomatis via WhatsApp"
      subtitle="Jangan sampai telat bayar pajak kendaraan dan kena denda. Set sekali, Woles ingatkan terus setiap tahun."
      problem="Banyak pemilik kendaraan lupa tanggal jatuh tempo pajak tahunan. Akibatnya kena denda 2% per bulan, atau lebih buruk — tertangkap razia karena STNK kadaluarsa. Masalahnya, tanggal pajak berbeda untuk tiap kendaraan dan susah diingat manual."
      solution="Dengan Woles, cukup kirim satu pesan WhatsApp berisi tanggal jatuh tempo pajak mobilmu. Woles akan otomatis mengingatkanmu 30 hari, 7 hari, dan 1 hari sebelum jatuh tempo — tanpa install app tambahan."
      waBubble={{
        user: "Pajak mobil saya jatuh tempo 20 Agustus",
        bot: "Saved ✅ Saya akan mengingatkan kamu pada 21 Juli, 13 Agustus, dan 19 Agustus untuk bayar pajak mobil.",
      }}
      benefits={[
        "Reminder 30, 7, dan 1 hari sebelum jatuh tempo — tidak ada yang terlewat",
        "Tidak perlu install aplikasi baru, cukup WhatsApp",
        "Bisa untuk semua kendaraan sekaligus — mobil, motor, truk",
        "Notifikasi langsung ke WhatsApp yang sudah kamu pakai sehari-hari",
        "Gratis tanpa batas waktu untuk fitur dasar",
      ]}
      faqs={FAQS}
      ctaText="Mulai Reminder Pajak Mobil via WhatsApp"
      waLink={WA_LINK}
      relatedLinks={[
        { href: "/reminder-stnk", label: "Reminder STNK" },
        { href: "/reminder-sim", label: "Reminder SIM" },
        { href: "/reminder-servis-mobil", label: "Reminder Servis Mobil" },
        { href: "/whatsapp-reminder", label: "Semua Reminder via WhatsApp" },
      ]}
      faqJsonLd={faqJsonLd}
    />
  );
}
