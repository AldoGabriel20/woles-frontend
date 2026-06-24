import type { Metadata } from "next";
import { SeoPageTemplate } from "@/components/landing/seo-page-template";

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6281234567890"}?text=Ingatkan+STNK+saya`;

const FAQS = [
  {
    q: "Apa yang terjadi kalau STNK mati?",
    a: "Kendaraan dengan STNK mati tidak bisa dikendarai secara legal di jalan. Bisa kena tilang dengan denda bervariasi, dan kamu tidak bisa perpanjang pajak tanpa STNK aktif.",
  },
  {
    q: "Kapan STNK harus diperbarui?",
    a: "STNK harus diperbarui setiap tahun bersamaan dengan pembayaran pajak kendaraan, dan wajib balik nama atau ganti plat setiap 5 tahun.",
  },
  {
    q: "Bagaimana cara set reminder STNK di Woles?",
    a: 'Kirim pesan ke Woles via WhatsApp, misalnya "STNK mobil saya habis 15 Agustus." Woles langsung jadwalkan reminder otomatis.',
  },
  {
    q: "Apakah reminder STNK bisa untuk beberapa kendaraan?",
    a: "Ya, kamu bisa set reminder untuk semua kendaraan. Cukup kirim satu pesan per kendaraan.",
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
  title: "Reminder STNK Otomatis via WhatsApp — Woles",
  description:
    "Jangan sampai STNK mati mendadak. Set reminder perpanjang STNK otomatis via WhatsApp dengan Woles.",
  keywords: ["reminder stnk", "pengingat stnk", "perpanjang stnk otomatis whatsapp"],
  alternates: { canonical: "https://woles.id/reminder-stnk" },
  openGraph: {
    title: "Reminder STNK Otomatis via WhatsApp — Woles",
    description: "Jangan sampai STNK mati mendadak. Set reminder otomatis via WhatsApp dengan Woles.",
    locale: "id_ID",
  },
};

export default function ReminderSTNKPage() {
  return (
    <SeoPageTemplate
      title="Reminder STNK Otomatis via WhatsApp"
      subtitle="STNK mati bisa bikin kamu ditilang atau tidak bisa berkendara. Set reminder sekali, Woles ingatkan setiap tahun."
      problem="STNK kendaraan wajib diperpanjang setiap tahun bersamaan dengan pajak. Tapi banyak orang baru sadar STNK mati saat sudah di jalan — atau malah saat ditilang polisi. Memperbarui setelah mati lebih ribet dan ada denda keterlambatan."
      solution="Cukup chat Woles di WhatsApp dengan menyebut tanggal habis STNK kamu. Woles akan mengingatkanmu jauh hari sebelum habis masa berlaku — langsung ke WhatsApp yang sudah kamu pakai setiap hari."
      waBubble={{
        user: "STNK motor saya habis 3 Oktober",
        bot: "Saved ✅ Saya akan mengingatkan kamu pada 3 September, 26 September, dan 2 Oktober untuk perpanjang STNK motor.",
      }}
      benefits={[
        "Reminder 30, 7, dan 1 hari sebelum STNK habis",
        "Tidak perlu hafal tanggal — cukup chat sekali",
        "Bisa untuk mobil, motor, dan semua kendaraan lain",
        "Langsung di WhatsApp — tidak perlu install app baru",
        "Mulai gratis, tanpa kartu kredit",
      ]}
      faqs={FAQS}
      ctaText="Mulai Reminder STNK via WhatsApp"
      waLink={WA_LINK}
      relatedLinks={[
        { href: "/reminder-pajak-mobil", label: "Reminder Pajak Mobil" },
        { href: "/reminder-sim", label: "Reminder SIM" },
        { href: "/reminder-servis-mobil", label: "Reminder Servis Mobil" },
        { href: "/whatsapp-reminder", label: "Semua Reminder via WhatsApp" },
      ]}
      faqJsonLd={faqJsonLd}
    />
  );
}
