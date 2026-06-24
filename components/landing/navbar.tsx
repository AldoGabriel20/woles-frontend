"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/50 bg-surface-container-lowest/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo/woles_horizontal_logo_uniform.png"
            alt="Woles"
            width={120}
            height={36}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="#features"
            className="text-label-md text-on-surface-variant hover:text-on-surface"
          >
            Fitur
          </Link>
          <Link
            href="#how-it-works"
            className="text-label-md text-on-surface-variant hover:text-on-surface"
          >
            Cara Kerja
          </Link>
          <Link
            href="#pricing"
            className="text-label-md text-on-surface-variant hover:text-on-surface"
          >
            Harga
          </Link>
          <Link
            href="#faq"
            className="text-label-md text-on-surface-variant hover:text-on-surface"
          >
            FAQ
          </Link>
        </nav>

        {/* CTA buttons */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-label-md text-on-surface hover:bg-surface-container"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-primary px-4 py-2 text-label-md text-on-primary shadow-sm hover:brightness-110"
          >
            Mulai Gratis
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((p) => !p)}
          className="flex h-9 w-9 items-center justify-center rounded-lg md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-outline-variant bg-surface-container-lowest px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 py-2">
            {[
              ["#features", "Fitur"],
              ["#how-it-works", "Cara Kerja"],
              ["#pricing", "Harga"],
              ["#faq", "FAQ"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-label-md text-on-surface hover:bg-surface-container"
              >
                {label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Link
                href="/login"
                className="rounded-lg border border-outline-variant px-4 py-2.5 text-center text-label-md text-on-surface"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-4 py-2.5 text-center text-label-md text-on-primary"
              >
                Mulai Gratis
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
