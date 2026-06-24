import Link from "next/link";

import { HowItWorks } from "@/components/landing/how-it-works";
import { FaqAccordion } from "@/components/landing/faq-accordion";
import type { FaqItem } from "@/components/landing/faq-accordion";

interface WaBubbleProps {
  user: string;
  bot: string;
}

export function WaBubble({ user, bot }: WaBubbleProps) {
  return (
    <div className="rounded-2xl bg-[#E5DDD5] p-4 shadow-inner">
      <div className="mb-2 flex justify-end">
        <div className="max-w-[80%] rounded-lg bg-[#DCF8C6] px-3 py-2 text-sm text-gray-800 shadow-sm">
          {user}
        </div>
      </div>
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-lg bg-white px-3 py-2 text-sm text-gray-800 shadow-sm">
          {bot}
        </div>
      </div>
    </div>
  );
}

interface RelatedLink {
  href: string;
  label: string;
}

export interface SeoPageProps {
  title: string;
  subtitle: string;
  problem: string;
  solution: string;
  waBubble: WaBubbleProps;
  benefits: string[];
  faqs: FaqItem[];
  ctaText: string;
  waLink: string;
  relatedLinks: RelatedLink[];
  faqJsonLd: object;
}

export function SeoPageTemplate({
  title,
  subtitle,
  problem,
  solution,
  waBubble,
  benefits,
  faqs,
  ctaText,
  waLink,
  relatedLinks,
  faqJsonLd,
}: SeoPageProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-surface py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="font-display text-[28px] font-bold text-on-surface sm:text-[36px]">
            {title}
          </h1>
          <p className="mt-3 text-body-md text-on-surface-variant">{subtitle}</p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-label-lg font-semibold text-white shadow hover:brightness-105"
          >
            {ctaText}
          </a>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 sm:px-6">
        {/* Problem */}
        <section>
          <h2 className="mb-3 font-display text-[22px] font-bold text-on-surface">
            Masalah yang Sering Terjadi
          </h2>
          <p className="text-body-md text-on-surface-variant">{problem}</p>
        </section>

        {/* Solution + WA example */}
        <section>
          <h2 className="mb-3 font-display text-[22px] font-bold text-on-surface">
            Solusi Mudah dengan Woles
          </h2>
          <p className="mb-5 text-body-md text-on-surface-variant">{solution}</p>
          <WaBubble {...waBubble} />
        </section>

        {/* Benefits */}
        <section>
          <h2 className="mb-4 font-display text-[22px] font-bold text-on-surface">
            Keuntungan Memakai Woles
          </h2>
          <ul className="space-y-3">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 text-[#25D366]">✓</span>
                <span className="text-body-md text-on-surface-variant">{b}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* How it works */}
      <div className="bg-surface-container-low">
        <HowItWorks />
      </div>

      {/* FAQ */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-6 font-display text-[22px] font-bold text-on-surface">
            Pertanyaan Umum
          </h2>
          <FaqAccordion items={faqs} />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-14 text-center">
        <div className="mx-auto max-w-xl px-4">
          <h2 className="font-display text-[24px] font-bold text-on-primary">
            {ctaText}
          </h2>
          <p className="mt-2 text-label-md text-on-primary/70">
            Tanpa install app. Langsung via WhatsApp.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-xl bg-white px-8 py-3.5 text-label-lg font-semibold text-primary shadow hover:bg-white/90"
          >
            Mulai Sekarang
          </a>
        </div>
      </section>

      {/* Internal links */}
      <section className="py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="mb-3 text-label-md font-medium text-on-surface-variant">
            Lihat juga:
          </p>
          <div className="flex flex-wrap gap-2">
            {relatedLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full border border-outline-variant px-3 py-1.5 text-label-sm text-primary hover:bg-surface-container"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
