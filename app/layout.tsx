import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Woles — Semua Urusan Hidup, Satu Chat Aja",
  description:
    "Ingatkan tagihan, dokumen penting, dan target keuangan — cukup dari WhatsApp. Tanpa install app.",
  icons: {
    icon: "/logo/woles_app_icon.png",
    apple: "/logo/woles_app_icon.png",
  },
  openGraph: {
    images: ["/logo/woles_primary_logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geist.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
